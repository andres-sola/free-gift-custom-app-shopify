if(document.querySelector('.discount-form')) {
  fetch('https://app.neatecommerce.ngrok.io/discounts', {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  }
  }).then((res) => {
    return res.json()
  }).then((res) => {
    localStorage.setItem('discount',JSON.stringify(res));
  });

  const discounts = JSON.parse(localStorage.getItem('discount'));
  const applyDiscount = {
    formContainer: document.querySelector('.discount-form'),
    discountPopupContainer: document.querySelector('.discount-popup-wrapper'),
    discountCodeContainer: document.querySelector('.discount-code'),
    showPopup: function() {
      this.discountPopupContainer.classList.add('show');
    },
    closePopup: function() {
      this.discountPopupContainer.querySelector('.close-popup').addEventListener('click', () => {
        this.discountPopupContainer.classList.remove('show');
      });
    },
    displayPopupContent: function(products) {
      var html = '',
          variantsList = [];
      products.forEach((variantId) => {
        const productInfo = window.allProducts.filter((product) => product.variants.some(variant => variant.id == variantId))[0];
        var optionHtml = '';

        productInfo.variants.forEach((variant) => {
          if(variant.available) {
            optionHtml += `
              <option ${variant.id == variantId ? `select` : '' } value="${variant.id}">${variant.title}</option>
            `
          }
        });
        html += `
          <div class="free-product">
            <img class="fp-image" src="${productInfo.images[0]}"/>
            <p class="fp-title">${productInfo.title}</p>
            <select class="fp-variants">
              ${optionHtml}
            </select>
          </div>
        `;
      });
      this.discountPopupContainer.querySelector('.popup-content').innerHTML = html;

      this.showPopup();
      this.closePopup();
      this.discountPopupContainer.querySelector('.add-free-products')
      .addEventListener('click', () => {
        this.discountPopupContainer.querySelectorAll('.free-product').forEach((product) => {
          variantsList.push(product.querySelector('.fp-variants').value);
        });

        let product_data = variantsList.map(variantId => {
          return {quantity: 1, id: variantId, properties: { _free: 'discount_free' } }
        })
    
        let send_data = {
          items: product_data
        }
              
        fetch('/cart/add.js', {
          body: JSON.stringify(send_data),
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With':'xmlhttprequest'
          },
          method: 'POST'
        }).then((response) => {
          return response.json();
        }).then((json) => {
          localStorage.setItem('added_products',JSON.stringify(variantsList));
          location.reload();
        }).catch((err) => {
          console.error(err)
        });
      });
    },
    discountCardTemplate: function(discountCode) {
      return(
      `
        <div class="discount_code_card">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><path d="M17.78 3.09C17.45 2.443 16.778 2 16 2h-5.165c-.535 0-1.046.214-1.422.593l-6.82 6.89c0 .002 0 .003-.002.003-.245.253-.413.554-.5.874L.738 8.055c-.56-.953-.24-2.178.712-2.737L9.823.425C10.284.155 10.834.08 11.35.22l4.99 1.337c.755.203 1.293.814 1.44 1.533z" fill-opacity=".55"></path><path d="M10.835 2H16c1.105 0 2 .895 2 2v5.172c0 .53-.21 1.04-.586 1.414l-6.818 6.818c-.777.778-2.036.782-2.82.01l-5.166-5.1c-.786-.775-.794-2.04-.02-2.828.002 0 .003 0 .003-.002l6.82-6.89C9.79 2.214 10.3 2 10.835 2zM13.5 8c.828 0 1.5-.672 1.5-1.5S14.328 5 13.5 5 12 5.672 12 6.5 12.672 8 13.5 8z"></path></svg>
          <span class="discount_code">${discountCode}</span>
          <span class="remove_discount">x</span>
        </div>
      `
      )
    },
    init: function() {
      this.applyDiscount();
      this.initialStatus();
      this.removeDiscount(null);
    },
    initialStatus: function() {

      this.formContainer.querySelector('.discount__input')
      .addEventListener('change', () => {
        const btn = this.formContainer.querySelector('.discount_btn');
        if(btn.classList.contains('deactive')) {
          btn.classList.remove('deactive');
          btn.classList.add('active');
        }
      });

      if(localStorage.getItem('applied_code')) {
        this.formContainer.querySelector('.discount_btn').classList.add('deactive');
        this.discountCodeContainer.innerHTML = this.discountCardTemplate(localStorage.getItem('applied_code'));
        if(document.querySelector('form[data-cart-form]')) {
          document.querySelector('form[data-cart-form]').innerHTML += `<input type="hidden" name="discount" value="${localStorage.getItem('applied_code')}"/>`
        }
      }
    },
    matchDiscounts: function(appliedCode) {
      return discounts.filter((discount) => discount.discountTitle == appliedCode); 
    },
    addFreeProducts: function(data) {
      const products = data.productsId.split(',').map((pro) => {
        const productId = pro.split('gid://shopify/ProductVariant/')[1];
        return productId;
      });

      this.displayPopupContent(products);
    },
    removeDiscount: function() {
      document.querySelectorAll('.remove_discount').forEach((close) => {
        close.addEventListener('click', (e) => {
          const discount_code = e.target.closest('.discount_code_card').querySelector('.discount_code').textContent;
          e.target.closest('.discount_code_card').remove();
        
          if(localStorage.getItem('added_products')) {
            console.log(JSON.parse(localStorage.getItem('added_products')));
            const products = JSON.parse(localStorage.getItem('added_products')).map((pro) => {
              return pro;
            });
            console.log(products);
            localStorage.removeItem('applied_code');
            let formData = {
              'updates': {}
            };
      
            let productID;
            for (productID in products) {
                formData['updates'][parseInt(products[productID])] = 0;
            }
      
            fetch('/cart/update.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            }).then(response => response.json()).then(data => {
                localStorage.removeItem('added_products');
                location.reload();
            }).catch((error) => {
                console.error('Error:', error);
            });
          }
        });
      });
    },
    applyDiscount: function() {
      const btn = this.formContainer.querySelector('.discount_btn');
      this.formContainer.querySelector('.discount_btn').addEventListener('click', () => {
        const result = this.matchDiscounts(this.formContainer.querySelector('.discount__input').value);
        if(result.length > 0) {
          btn.textContent = 'Adding...';
          setTimeout(() => {
            btn.textContent = 'Apply';
            this.discountCodeContainer.innerHTML = this.discountCardTemplate(result[0].discountTitle);
            this.formContainer.querySelector('.discount__input').value = '';
            localStorage.setItem('applied_code',result[0].discountTitle);

            if(result[0].productsId) {
              this.addFreeProducts(result[0]);
            }
            this.removeDiscount();
          },500);
        } else {
          btn.classList.contains('active') ? 
            btn.classList.remove('active') : '';
          
          this.formContainer.querySelector('.discount_btn').classList.add('deactive');
        }
      });
    }
  }
  applyDiscount.init();
}

console.log('sync');