function initShoppingCart() {
  const FIELDS = {
    products: '#products-container',
    cartContainer: '#cart-container',
    cartCount: '#cart-count',
    cartItems: '#cart-container',
    subTotal: '#subtotal',
    total: '#total',
    clearCart: '#clear-cart',
    checkOut: '#checkout',
    cartSummary: '#cart-summary',
  };

  const products = [
    {
      id: 1,
      name: 'Wireless Mouse',
      price: 499,
      image: 'https://img.freepik.com/premium-photo/mouse-white_959815-274.jpg',
    },
    {
      id: 2,
      name: 'Bluetooth Speaker',
      price: 1299,
      image:
        'https://img.freepik.com/premium-photo/black-bluetooth-speaker-with-lights_74692-123.jpg',
    },
    {
      id: 3,
      name: 'Laptop Stand',
      price: 799,
      image:
        'https://img.freepik.com/premium-photo/aluminum-laptop-stand-improve-ventilation-white-background-isolation_106745-1640.jpg',
    },
    {
      id: 4,
      name: 'USB-C Hub',
      price: 999,
      image:
        'https://img.freepik.com/premium-photo/multiport-tech-hub-white-background_431161-37141.jpg',
    },
    {
      id: 5,
      name: 'Headphones',
      price: 2999,
      image: 'https://img.freepik.com/premium-photo/headphones-white_1155277-4258.jpg',
    },
  ];
  let cartData = new Map();

  const createProductState = () => {
    let productsData = new Map(
      products.map((product) => [product.id, { data: product, dom: null }])
    );

    const populateProducts = () => {
      //console.log('Populate products', productMap.get(1).name);
      const productContainer = document.querySelector(FIELDS.products);

      productsData.forEach((product) => {
        const { id, name, price, image } = product.data;
        const div = document.createElement('div');
        div.classList.add('product-card');
        div.setAttribute('data-id', id);

        // Product Image
        const img = document.createElement('img');
        img.src = image; // assumes product.image exists
        img.alt = name;
        img.classList.add('product-image');
        div.appendChild(img);

        // Product Name
        const nameEle = document.createElement('h3');
        nameEle.textContent = name;
        nameEle.classList.add('product-name');
        div.appendChild(nameEle);

        // Product Price
        const priceP = document.createElement('p');
        priceP.textContent = `₹${price}`;
        priceP.classList.add('product-price');
        div.appendChild(priceP);

        //add to cart
        const cartBtn = document.createElement('button');
        cartBtn.textContent = `Buy`;
        cartBtn.classList.add('btn-secondary');
        div.appendChild(cartBtn);

        product.dom = div;
        productContainer.appendChild(div);
      });
    };
    console.log(productsData);

    return {
      productsData,
      populateProducts,
    };
  };

  const createCartUIController = (products) => {
    const elements = {
      cartCount: document.querySelector(FIELDS.cartCount),
      cartItems: document.querySelector(FIELDS.cartItems),
      subTotal: document.querySelector(FIELDS.subTotal),
      total: document.querySelector(FIELDS.total),
      clearCart: document.querySelector(FIELDS.clearCart),
      checkOut: document.querySelector(FIELDS.checkOut),
      productsContainer: document.querySelector(FIELDS.products),
      cartContainer: document.querySelector(FIELDS.cartContainer),
      cartSummary: document.querySelector(FIELDS.cartSummary),
    };

    const updateCartUI = () => {
      renderCartItems();
      updateCartCount();
      updateCartSummary();
    };

    const renderCartItems = () => {
      const { cartContainer } = elements;
      cartContainer.innerHTML = '';

      if (cartData.size === 0) {
        cartContainer.innerHTML = `<div class="empty-cart">Your cart is empty. Add some products!</div>`;
        return;
      }

      cartData.forEach(({ data, quantity }, id) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'item-info';

        const imgDiv = document.createElement('div');
        imgDiv.className = 'item-image';
        const img = document.createElement('img');
        img.src = data.image;
        img.alt = data.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '50%';
        imgDiv.appendChild(img);

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'item-details';
        detailsDiv.innerHTML = `<h4>${data.name}</h4>`;

        infoDiv.appendChild(imgDiv);
        infoDiv.appendChild(detailsDiv);

        const priceP = document.createElement('div');
        priceP.className = 'item-price';
        priceP.textContent = `₹${data.price * quantity}`;

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'quantity-controls';

        const minusBtn = document.createElement('button');
        minusBtn.className = 'quantity-btn';
        minusBtn.textContent = '-';
        minusBtn.onclick = () => updateQuantity(id, -1);

        const qtyDisplay = document.createElement('div');
        qtyDisplay.className = 'quantity-display';
        qtyDisplay.textContent = quantity;

        const plusBtn = document.createElement('button');
        plusBtn.className = 'quantity-btn';
        plusBtn.textContent = '+';
        plusBtn.onclick = () => updateQuantity(id, 1);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => removeFromCart(id);

        controlsDiv.appendChild(minusBtn);
        controlsDiv.appendChild(qtyDisplay);
        controlsDiv.appendChild(plusBtn);
        controlsDiv.appendChild(removeBtn);

        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(priceP);
        itemDiv.appendChild(controlsDiv);

        cartContainer.appendChild(itemDiv);
      });
    };

    const updateCartSummary = () => {
      console.log(cartData);
      let { subTotal, total, cartSummary } = elements;
      let totalPrice = 0;
      cartData.forEach(({ data, quantity }) => {
        totalPrice += data.price * quantity;
      });
      if (!(cartData.size === 0)) {
        cartSummary.style.display = 'block';
        total.textContent = `₹${totalPrice}`;
      } else cartSummary.style.display = 'none';
    };

    const updateCartCount = () => {
      const { cartCount } = elements;
      const count = Array.from(cartData.values()).reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = count;
    };

    const removeFromCart = (itemID) => {
      console.log('Remove clicked', itemID);
      if (cartData.has(itemID)) {
        cartData.delete(itemID);
      }
      updateCartUI();
    };

    const updateQuantity = (productId, change) => {
      if (!cartData.has(productId)) return;

      const item = cartData.get(productId);
      item.quantity += change;

      if (item.quantity <= 0) {
        cartData.delete(productId);
      } else {
        cartData.set(productId, item);
      }
      updateCartUI();
    };

    return {
      updateCartUI,
      elements,
    };
  };

  const createEventController = (products, ui) => {
    //add to cart
    const handleAddToCart = (e) => {
      if (e.target.nodeName.toLowerCase() === 'button') {
        const productDiv = e.target.closest('.product-card');
        const id = productDiv.getAttribute('data-id');
        const product = products.productsData.get(Number(id));
        console.log(product);
        // Add to cartData
        if (cartData.has(id)) {
          cartData.get(id).quantity += 1;
        } else {
          cartData.set(id, {
            data: product.data,
            quantity: 1,
          });
        }
        console.log(cartData);
        ui.updateCartUI();
      }
    };

    const handleClearCart = (e) => {
      cartData.clear();
      ui.updateCartUI();
    };

    const setupEventListeners = () => {
      const { productsContainer, clearCart, checkOut } = ui.elements;

      productsContainer.addEventListener('click', handleAddToCart);
      clearCart.addEventListener('click', handleClearCart);
    };

    return {
      setupEventListeners,
    };
  };

  const initialize = () => {
    const products = createProductState();
    products.populateProducts();

    const ui = createCartUIController(products);
    const events = createEventController(products, ui);
    events.setupEventListeners();
  };

  return initialize();
}

document.addEventListener('DOMContentLoaded', initShoppingCart);
