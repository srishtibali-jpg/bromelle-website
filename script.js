// Bromelle WhatsApp order number, including India country code.
const WHATSAPP_NUMBER = "919999083290";
const SHIPPING_FEE = 90;

// A new storage key prevents old sample products from appearing in the cart.
const CART_STORAGE_KEY = "bromelle-cart-v2";
const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");

const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTotal = document.getElementById("cartTotal");
const openCartButton = document.getElementById("openCart");
const closeCartButton = document.getElementById("closeCart");
const checkoutForm = document.getElementById("checkoutForm");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
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

function getActiveValue(card, selector, dataKey) {
  const activeButton = card.querySelector(`${selector} .option-button.active`);
  return activeButton ? activeButton.dataset[dataKey] : "";
}

function getSelectedVariant(card) {
  return getActiveValue(card, ".variant-toggle", "variant") || "jaggery";
}

function getSelectedSize(card) {
  if (card.classList.contains("has-size-options")) {
    return getActiveValue(card, ".size-toggle", "size") || "4";
  }

  return card.dataset.size;
}

function getProductPrice(card, variant, size) {
  let rawPrice;

  if (card.classList.contains("has-size-options")) {
    // Read the exact HTML attribute, for example:
    // data-jaggery-price-4="200"
    rawPrice = card.getAttribute(`data-${variant}-price-${size}`);
  } else {
    // Regular products use attributes such as:
    // data-jaggery-price="200"
    rawPrice = card.getAttribute(`data-${variant}-price`);
  }

  const price = Number(rawPrice);

  if (!Number.isFinite(price)) {
    console.error("Invalid product price", {
      product: card.dataset.name,
      variant,
      size,
      rawPrice
    });
    return 0;
  }

  return price;
}

function getVariantLabel(variant) {
  return variant === "dates" ? "Dates Powder" : "Jaggery Powder";
}

function getSizeLabel(card, size) {
  return card.classList.contains("has-size-options")
    ? `Pack of ${size}`
    : size;
}

function updateCardSelection(card) {
  const variant = getSelectedVariant(card);
  const size = getSelectedSize(card);
  const price = getProductPrice(card, variant, size);

  card.querySelector(".product-price").textContent = formatCurrency(price);

  const sizeLabel = card.querySelector(".selected-size-label");
  if (sizeLabel) {
    sizeLabel.textContent = getSizeLabel(card, size);
  }
}

function activateOption(button) {
  const optionContainer = button.parentElement;

  optionContainer.querySelectorAll(".option-button").forEach(option => {
    const isActive = option === button;
    option.classList.toggle("active", isActive);
    option.setAttribute("aria-pressed", String(isActive));
  });

  updateCardSelection(button.closest(".product-card"));
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
    cartItems.innerHTML =
      '<p class="empty-cart">Your cart is empty. Add something delicious!</p>';
  } else {
    cart.forEach(item => {
      const element = document.createElement("div");
      element.className = "cart-item";

      element.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <small>${item.variant} · ${item.size}</small>
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

      const [decreaseButton, increaseButton] =
        element.querySelectorAll(".qty-controls button");

      decreaseButton.addEventListener("click", () =>
        updateQuantity(item.id, -1)
      );

      increaseButton.addEventListener("click", () =>
        updateQuantity(item.id, 1)
      );

      element
        .querySelector(".remove-item")
        .addEventListener("click", () => removeFromCart(item.id));

      cartItems.appendChild(element);
    });
  }

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCount.textContent = count;
  cartSubtotal.textContent = formatCurrency(total);
  cartTotal.textContent = formatCurrency(total + SHIPPING_FEE);
}

document.querySelectorAll(".option-button").forEach(button => {
  button.addEventListener("click", () => activateOption(button));
});

document.querySelectorAll(".product-card").forEach(card => {
  updateCardSelection(card);
});

document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", event => {
    const card = event.target.closest(".product-card");
    const variant = getSelectedVariant(card);
    const size = getSelectedSize(card);
    const variantLabel = getVariantLabel(variant);
    const sizeLabel = getSizeLabel(card, size);
    const price = getProductPrice(card, variant, size);

    // Variants and pack sizes remain separate line items in the cart.
    const itemId = [
      card.dataset.id,
      variant,
      String(size).replace(/\s+/g, "-").toLowerCase()
    ].join("-");

    addToCart({
      id: itemId,
      name: card.dataset.name,
      variant: variantLabel,
      size: sizeLabel,
      price
    });
  });
});

openCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) {
    closeCart();
  }
});

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

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const notes =
    document.getElementById("orderNotes").value.trim() || "None";

  const orderLines = cart
    .map(
      item =>
        `• ${item.name} (${item.variant}, ${item.size}) x ${item.quantity} = ${formatCurrency(
          item.price * item.quantity
        )}`
    )
    .join("\n");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + SHIPPING_FEE;

  const message = [
    "Hi Bromelle! I would like to place an order.",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Delivery address: ${address}`,
    "",
    "Order:",
    orderLines,
    "",
    `Subtotal: ${formatCurrency(subtotal)}`,
    `Shipping: ${formatCurrency(SHIPPING_FEE)}`,
    `Total: ${formatCurrency(total)}`,
    `Notes: ${notes}`
  ].join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;

  window.open(url, "_blank", "noopener,noreferrer");
});

function openCustomOrder() {
  const message =
    "Hi Bromelle! I would like to discuss a custom or bulk bakery order.";

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
}

document
  .getElementById("customOrderButton")
  .addEventListener("click", event => {
    event.preventDefault();
    openCustomOrder();
  });

document
  .getElementById("whatsAppContact")
  .addEventListener("click", event => {
    event.preventDefault();
    openCustomOrder();
  });


document.getElementById("year").textContent =
  new Date().getFullYear();

renderCart();
