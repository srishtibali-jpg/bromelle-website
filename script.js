// ========= EDIT THESE VALUES BEFORE PUBLISHING =========
const WHATSAPP_NUMBER = "919999083290"; // Example: 919876543210
const RAZORPAY_PAYMENT_LINK = "https://rzp.io/l/your-payment-link";
// =======================================================

const cart = JSON.parse(localStorage.getItem("bromelle-cart") || "[]");

const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const openCartButton = document.getElementById("openCart");
const closeCartButton = document.getElementById("closeCart");
const checkoutForm = document.getElementById("checkoutForm");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

function saveCart() {
  localStorage.setItem("bromelle-cart", JSON.stringify(cart));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  renderCart();
  openCart();
}

function updateQuantity(id, change) {
  const item = cart.find(product => product.id === id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  const index = cart.findIndex(product => product.id === id);
  if (index > -1) {
    cart.splice(index, 1);
  }
  saveCart();
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">Your cart is empty. Add something delicious!</div>';
  } else {
    cart.forEach(item => {
      const element = document.createElement("div");
      element.className = "cart-item";
      element.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <small>${formatCurrency(item.price)} each</small>
          <div class="qty-controls">
            <button type="button" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div>
          <strong>${formatCurrency(item.price * item.quantity)}</strong>
          <button type="button" class="remove-item">Remove</button>
        </div>
      `;

      const [decreaseButton, increaseButton] = element.querySelectorAll(".qty-controls button");
      decreaseButton.addEventListener("click", () => updateQuantity(item.id, -1));
      increaseButton.addEventListener("click", () => updateQuantity(item.id, 1));
      element.querySelector(".remove-item").addEventListener("click", () => removeFromCart(item.id));

      cartItems.appendChild(element);
    });
  }

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = count;
  cartTotal.textContent = formatCurrency(total);
}

document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", event => {
    const card = event.target.closest(".product-card");
    addToCart({
      id: card.dataset.id,
      name: card.dataset.name,
      price: Number(card.dataset.price)
    });
  });
});

openCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

checkoutForm.addEventListener("submit", event => {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty. Please add at least one item.");
    return;
  }

  if (WHATSAPP_NUMBER.includes("X")) {
    alert("Please replace WHATSAPP_NUMBER in script.js before using checkout.");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const date = document.getElementById("deliveryDate").value;
  const notes = document.getElementById("orderNotes").value.trim() || "None";

  const orderLines = cart
    .map(item => `• ${item.name} x ${item.quantity} = ${formatCurrency(item.price * item.quantity)}`)
    .join("\n");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const message = [
    "Hi Bromelle! I would like to place an order.",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Delivery date: ${date}`,
    `Address: ${address}`,
    "",
    "Order:",
    orderLines,
    "",
    `Subtotal: ${formatCurrency(total)}`,
    "Delivery charges: To be confirmed",
    `Notes: ${notes}`,
    "",
    `Payment link: ${RAZORPAY_PAYMENT_LINK}`
  ].join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

function openCustomOrder() {
  if (WHATSAPP_NUMBER.includes("X")) {
    alert("Please replace WHATSAPP_NUMBER in script.js.");
    return;
  }

  const message = "Hi Bromelle! I would like to discuss a custom or bulk bakery order.";
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
}

document.getElementById("customOrderButton").addEventListener("click", event => {
  event.preventDefault();
  openCustomOrder();
});

document.getElementById("whatsAppContact").addEventListener("click", event => {
  event.preventDefault();
  openCustomOrder();
});

const today = new Date();
const minDate = new Date(today);
minDate.setDate(today.getDate() + 1);
document.getElementById("deliveryDate").min = minDate.toISOString().split("T")[0];

document.getElementById("year").textContent = new Date().getFullYear();
renderCart();
