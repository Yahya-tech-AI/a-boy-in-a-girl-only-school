const CART_KEY = "paradeArmyCartV2";
const PRICE = 199;
const PRODUCT = {
  id: "collector-bundle",
  name: "Parade Army Collector Bundle",
  description:
    "Storybook, notebook, character + infinity stickers, two badges, three collectible cards, branded packaging",
  price: PRICE,
};
const $ = (s) => document.querySelector(s);
const money = (n) => `${n.toLocaleString("en-US")} EGP`;
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
  updateCount();
}
function addBundle() {
  const cart = getCart();
  const item = cart.find((x) => x.id === PRODUCT.id);
  if (item) item.qty += 1;
  else cart.push({ ...PRODUCT, qty: 1 });
  saveCart(cart);
  showToast("Added to cart ✦");
}
function updateCount() {
  const count = getCart().reduce((n, x) => n + x.qty, 0);
  document
    .querySelectorAll("#cartCount")
    .forEach((el) => (el.textContent = count));
}
function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
function renderCart() {
  const host = $("#cartItems");
  if (!host) return;
  const cart = getCart();
  host.innerHTML = "";
  const empty = $("#emptyCart");
  if (empty) empty.hidden = cart.length !== 0;
  cart.forEach((item) => {
    const row = document.createElement("article");
    row.className = "cart-row";
    row.innerHTML = `<div><div class="cart-product-title"></div><div class="cart-product-sub">Collector's edition · ${money(item.price)} each</div><div class="cart-controls"><button class="qty-btn" data-action="minus" aria-label="Decrease quantity">−</button><strong>${item.qty}</strong><button class="qty-btn" data-action="plus" aria-label="Increase quantity">+</button><button class="remove-btn" data-action="remove">Remove</button></div></div><div class="line-price">${money(item.price * item.qty)}</div>`;
    row.querySelector(".cart-product-title").textContent = item.name;
    row.querySelectorAll("button").forEach((btn) =>
      btn.addEventListener("click", () => {
        let current = getCart();
        let target = current.find((x) => x.id === item.id);
        if (!target) return;
        if (btn.dataset.action === "plus") target.qty++;
        if (btn.dataset.action === "minus") target.qty--;
        if (btn.dataset.action === "remove") target.qty = 0;
        current = current.filter((x) => x.qty > 0);
        saveCart(current);
        renderCart();
      }),
    );
    host.appendChild(row);
  });
  const subtotal = cart.reduce((n, x) => n + x.price * x.qty, 0);
  const total = $("#subtotal");
  if (total) total.textContent = money(subtotal);
}
function init() {
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
  updateCount();
  renderCart();
  $("#addBundle")?.addEventListener("click", addBundle);
  $("#heroAdd")?.addEventListener("click", addBundle);
  const menu = $("#menuBtn");
  menu?.addEventListener("click", () => {
    const links = $("#navlinks");
    const open = links.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll("#navlinks a").forEach((a) =>
    a.addEventListener("click", () => {
      $("#navlinks")?.classList.remove("open");
      menu?.setAttribute("aria-expanded", "false");
    }),
  );
  window.addEventListener(
    "scroll",
    () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = $("#progress");
      if (progress)
        progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    },
    { passive: true },
  );
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  } else
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("show"));
  $("#orderForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const cart = getCart();
    if (!cart.length) {
      $("#formMessage").textContent =
        "Your cart is empty. Add the bundle before preparing an order.";
      return;
    }
    const data = new FormData(event.currentTarget);
    const total = cart.reduce((n, x) => n + x.price * x.qty, 0);
    const lines = [
      "PARADE ARMY BY YAYA — ORDER REQUEST",
      `Name: ${data.get("customerName")}`,
      `Phone: ${data.get("phone")}`,
      `Address: ${data.get("address")}`,
      `Notes: ${data.get("notes") || "None"}`,
      "Items:",
      ...cart.map((x) => `${x.name} x${x.qty} — ${money(x.price * x.qty)}`),
      `Subtotal: ${money(total)}`,
      "Delivery fee: to be confirmed",
      "Please confirm availability and delivery details.",
    ];
    const message = lines.join("\\n");
    $("#formMessage").textContent =
      "Order request prepared. Choose Copy to copy the message, then send it to your shop contact.";
    let existing = $("#copyOrder");
    if (!existing) {
      existing = document.createElement("button");
      existing.type = "button";
      existing.id = "copyOrder";
      existing.className = "btn secondary";
      existing.textContent = "Copy order request";
      $("#orderForm").appendChild(existing);
    }
    existing.onclick = async () => {
      try {
        await navigator.clipboard.writeText(message);
        $("#formMessage").textContent =
          "Order request copied. Send it to your shop contact to confirm the order.";
      } catch {
        const blob = new Blob([message], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "parade-army-order.txt";
        a.click();
        URL.revokeObjectURL(url);
        $("#formMessage").textContent =
          "Downloaded your order request as a text file.";
      }
    };
  });
}
document.addEventListener("DOMContentLoaded", init);
