"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { apiFetch, unwrap, currentUser, currentUserId, resolveUploadUrl } from "@/lib/api";

const initialAddress = {
  address_label: "Home",
  house_no_floor: "",
  building_block: "",
  area_name: "",
  recipient_name: "",
  phone_number: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
};

// Checkout: same structure/texts/flow as the previous UI —
// Shipping Address card, Order Summary with tax/shipping math,
// saved addresses, payment methods, success screen.
export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [address, setAddress] = useState(initialAddress);
  // Cash on Delivery is currently the only payment method.
  const paymentMethod = "cod";
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);

  // Auth gate + user hydration must run client-side after mount
  // (localStorage is invisible to the server). Mount-sync reads intentional.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const token = localStorage.getItem("hc_token");
    const session = localStorage.getItem("hc_session");
    if (!token && !session) {
      router.push("/login");
      return;
    }
    let parsedUser = currentUser();
    const uid = currentUserId();
    if (parsedUser) setUser(parsedUser);
    if (!uid) return;
    setUserId(uid);
    let live = true;
    apiFetch("/Addresses")
      .then(unwrap)
      .then((all) => {
        if (!live) return;
        const list = (Array.isArray(all) ? all : []).filter((a) => a.user_id === uid);
        setSavedAddresses(list);
        const def = list.find((a) => a.isdefault === 1 || a.isdefault === true) || list[0];
        if (def) {
          setSelectedAddressId(def.address_id);
           setAddress({
             address_label: def.address_label || "Home",
             house_no_floor: def.house_no_floor || def.house_street || "",
             building_block: def.building_block || "",
             area_name: def.area_name || def.landmark || "",
             recipient_name: def.full_name || "",
            phone_number: def.mobile_number || "",
            city: def.city || "",
            state: def.state || "",
            postal_code: def.pincode || "",
            country: "India",
          });
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [router]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (cart?.ready && cart.items.length === 0 && !success) {
      router.push("/cart");
    }
  }, [cart, success, router]);

  if (!cart?.ready) return <p className="mx-auto max-w-4xl px-4 py-14 text-center">Loading checkout...</p>;

  const discountedTotal = cart.total;
  const discountAmount = cart.discount;
  const shippingPrice = discountedTotal >= 5000 ? 0 : 150;
  // Product prices already include GST. Do not add tax again at checkout.
  const taxAmount = 0;
  const totalPrice = discountedTotal + shippingPrice;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);

    try {
      let statuses = [];
      try {
        statuses = unwrap(await apiFetch("/Order-Status-Master"));
        if (!Array.isArray(statuses)) statuses = [];
      } catch {
        statuses = [];
      }
      let pendingStatus = statuses.find(
        (s) => s.status_code?.toLowerCase() === "pending" || s.status_name?.toLowerCase() === "pending"
      );
      if (!pendingStatus) {
        const created = unwrap(
          await apiFetch("/Order-Status-Master", {
            method: "POST",
            body: {
              status_name: "Pending",
              status_code: "PENDING",
              status_description: "Order placed, pending processing",
              isactive: 1,
              rcu: "website",
            },
          })
        );
        pendingStatus = created;
      }
      const orderStatusId = pendingStatus?.order_status_id;
      if (!orderStatusId) {
        throw new Error("Could not resolve order status. Please try again.");
      }

      const orderNumber = `ORD-${Date.now()}`;
      // Column names must match the Orders table: subtotal (pre-discount),
      // shipping_amount, total_amount — anything else is dropped by the API.
      const orderRes = await apiFetch("/Orders", {
        method: "POST",
        body: {
          user_id: userId,
          order_number: orderNumber,
          order_status_id: orderStatusId,
          order_date: new Date().toISOString(),
          subtotal: cart.subtotal,
          discount_amount: discountAmount || 0,
          tax_amount: taxAmount,
          shipping_amount: shippingPrice,
          total_amount: totalPrice,
          payment_status: "pending",
          rcu: "website",
        },
      });
      const order = orderRes?.data || orderRes;
      const orderId = order?.order_id;
      if (!orderId) {
        throw new Error("Order could not be created.");
      }

      await Promise.all(
        cart.items.map((item) =>
          apiFetch("/Order-Items", {
            method: "POST",
            body: {
              order_id: orderId,
              product_id: item.product_id || item.id,
              product_variant_id: item.product_variant_id || null,
              product_name: item.name,
              sku: item.sku || item.product_variant_id || "SKU",
              qty: item.qty || 1,
              unit_price: item.price || 0,
              rcu: "website",
            },
          })
        )
      );

      await apiFetch("/Order-Addresses", {
        method: "POST",
        body: {
          order_id: orderId,
          address_type: "shipping",
          full_name: address.recipient_name,
          mobile_number: address.phone_number,
          address_label: address.address_label,
          house_no_floor: address.house_no_floor,
          building_block: address.building_block,
          area_name: address.area_name,
          house_street: `${address.house_no_floor}, ${address.building_block}`,
          city: address.city,
          state: address.state,
          pincode: address.postal_code,
          landmark: address.area_name,
          country: address.country,
          rcu: "website",
        },
      }).catch(() => null);

      await apiFetch("/Order-Status-History", {
        method: "POST",
        body: {
          order_id: orderId,
          order_status_id: orderStatusId,
          orderstatus: "Pending",
          remarks: "Order placed via website",
          rcu: "website",
        },
      }).catch(() => null);

      if (userId && saveAddress && !selectedAddressId) {
        try {
          await apiFetch("/Addresses", {
            method: "POST",
            body: {
              user_id: userId,
              full_name: address.recipient_name,
              mobile_number: address.phone_number,
              emailid: "",
              address_label: address.address_label,
              house_no_floor: address.house_no_floor,
              building_block: address.building_block,
              area_name: address.area_name,
              house_street: `${address.house_no_floor}, ${address.building_block}`,
              city: address.city,
              state: address.state,
              pincode: address.postal_code,
              landmark: address.area_name,
              country: address.country,
              isdefault: savedAddresses.length === 0 ? 1 : 0,
              isactive: 1,
              rcu: "website",
            },
          });
        } catch (addressErr) {
          console.error("Failed to save address to user account", addressErr);
        }
      }

      // COD goes in payment_provider (free text). payment_method_type only
      // accepts card/upi/netbanking/wallet server-side — "cod" would 400.
      const finalizeOrder = async () => {
        cart.clearCart();
        cart.removeCoupon?.();
        setSuccess(true);
        setTimeout(() => router.push("/orders"), 1500);
      };

      await apiFetch("/Payments", {
        method: "POST",
        body: {
          order_id: orderId,
          user_id: userId,
          amount: totalPrice,
          payment_provider: paymentMethod,
          payment_status: "pending",
          payment_date: new Date().toISOString(),
          rcu: "website",
        },
      }).catch(() => null);
      await finalizeOrder();
      return;
    } catch (err) {
      setError(err.message || "Checkout failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <div className="bg-green-50 p-6">
          <h4 className="font-display text-2xl font-bold">Order placed successfully!</h4>
          <p className="mt-2 text-sm">Thank you for your purchase. You will be redirected shortly.</p>
        </div>
      </div>
    );
  }

  const inputCls = "w-full border border-neutral-300 px-3 py-2 text-sm focus:border-gold focus:outline-none";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="mb-4 font-display text-4xl font-bold">Checkout</h2>
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="border border-neutral-200 bg-white p-5 shadow-sm">
          <h5 className="mb-3 font-semibold">Shipping Address</h5>
          {error && <div className="mb-3 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {savedAddresses.length > 0 && (
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium">Select a saved address</label>
              <select
                value={selectedAddressId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedAddressId(id);
                  // Dropdown values are strings; DB ids may be numbers — compare loosely.
                  const addr = savedAddresses.find((a) => String(a.address_id) === String(id));
                   if (addr) {
                     setAddress({
                       address_label: addr.address_label || "Home",
                       house_no_floor: addr.house_no_floor || addr.house_street || "",
                       building_block: addr.building_block || "",
                       area_name: addr.area_name || addr.landmark || "",
                       recipient_name: addr.full_name || "",
                       phone_number: addr.mobile_number || "",
                      city: addr.city || "",
                      state: addr.state || "",
                      postal_code: addr.pincode || "",
                      country: "India",
                    });
                  }
                }}
                className={`${inputCls} mb-2`}
              >
                <option value="">Use a saved address</option>
                {savedAddresses.map((addr) => (
                  <option value={addr.address_id} key={addr.address_id}>
                    {addr.address_label || "Address"} — {addr.full_name}, {addr.city}
                  </option>
                ))}
              </select>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <fieldset className="mb-4">
              <legend className="mb-2 text-sm font-semibold">Address details</legend>
              <div className="mb-3 flex flex-wrap gap-2">
                {["Home", "Work", "Other"].map((label) => (
                  <label key={label} className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold ${address.address_label === label ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 text-neutral-600"}`}>
                    <input type="radio" name="address_label" value={label} checked={address.address_label === label} onChange={handleChange} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
              <div className="mb-3"><label className="mb-1 block text-sm font-medium">House no. &amp; floor</label><input type="text" name="house_no_floor" value={address.house_no_floor} onChange={handleChange} required className={inputCls} /></div>
              <div className="mb-3"><label className="mb-1 block text-sm font-medium">Building &amp; block no.</label><input type="text" name="building_block" value={address.building_block} onChange={handleChange} required className={inputCls} /></div>
              <div className="mb-3"><label className="mb-1 block text-sm font-medium">Landmark &amp; area name</label><input type="text" name="area_name" value={address.area_name} onChange={handleChange} required className={inputCls} /></div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Receiver details</legend>
              <div className="mb-3"><label className="mb-1 block text-sm font-medium">Name</label><input type="text" name="recipient_name" value={address.recipient_name} onChange={handleChange} required className={inputCls} /></div>
              <div className="mb-3"><label className="mb-1 block text-sm font-medium">Phone number</label><input type="tel" name="phone_number" value={address.phone_number} onChange={handleChange} required className={inputCls} /></div>
            </fieldset>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium">City</label>
                <input type="text" name="city" value={address.city} onChange={handleChange} required className={inputCls} />
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium">State</label>
                <input type="text" name="state" value={address.state} onChange={handleChange} required className={inputCls} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium">Postal Code</label>
                <input type="text" name="postal_code" value={address.postal_code} onChange={handleChange} required className={inputCls} />
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium">Country</label>
                <input type="text" name="country" value={address.country} onChange={handleChange} required className={inputCls} />
              </div>
            </div>
            {userId && (
              <div className="mb-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  id="saveAddress"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                />
                <label htmlFor="saveAddress">Save this address to my account</label>
              </div>
            )}
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium">Payment Method</label>
              <p className="border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-semibold">
                Cash on Delivery
              </p>
            </div>
            <button type="submit" disabled={placing} className="btn-primary w-full disabled:opacity-50">
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>
         <div className="h-fit border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:self-start">
          <h5 className="mb-3 font-semibold">Order Summary</h5>
           <div className="space-y-4">
             {cart.items.map((item, index) => {
               const productHref = `/product/${item.slug || item.product_id || item.id}`;
               const itemImage = resolveUploadUrl(item.image) || "/brand/logo-black.png";
               return (
                 <div
                   className="flex gap-3 border-b border-neutral-100 pb-4 last:border-b-0 last:pb-0"
                   key={item.key || `${item.id}-${item.product_variant_id || "default"}-${index}`}
                 >
                   <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                     {index + 1}
                   </span>
                   <Link href={productHref} className="h-20 w-16 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-50" aria-label={`View ${item.name || "product"}`}>
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={itemImage} alt={item.name || "Product"} className="h-full w-full object-cover transition-transform hover:scale-105" />
                   </Link>
                   <div className="min-w-0 flex-1">
                     <Link href={productHref} className="block text-sm font-semibold text-neutral-900 underline-offset-2 hover:underline">
                       {item.name}
                     </Link>
                     <p className="mt-1 text-xs text-neutral-500">Qty: {item.qty || 1}</p>
                     <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-neutral-500">
                       {item.size && <span>Size: {item.size}</span>}
                       {item.color && <span>Color: {item.color}</span>}
                     </div>
                   </div>
                   <span className="shrink-0 text-sm font-semibold text-neutral-900">
                     ₹{((item.price || 0) * (item.qty || 1)).toLocaleString("en-IN")}
                   </span>
                 </div>
               );
             })}
           </div>
          <hr className="my-3" />
          <div className="mb-2 flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{cart.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {cart.coupon && (
            <div className="mb-2 flex justify-between text-sm text-green-700">
              <span>Discount ({cart.coupon.coupon_code})</span>
              <span>-₹{cart.discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="mb-2 flex justify-between text-sm">
            <span>Shipping</span>
            <span>{discountedTotal >= 5000 ? "Free" : "₹150"}</span>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
