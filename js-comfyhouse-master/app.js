//contentful - can deliver the products dynamically rather implementing local data
    // To use contentful.com simply uncomment few of the blocks associated with contentful  
// const client = contentful.createClient({
//     // This is the space ID. A space is like a project folder in Contentful terms
//     space: "",//pass space id 
//     // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
//     accessToken: ""//pass access token
//     });
    //console.log(client);

//declare bunch of variables 
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

//for getting/placing info of products
//cart 
let cart =[];  //array
//buttons
let buttonsDOM =[];

//classes

//responsible for getting products -first from (locally) json file later on we'll do that dynamically from a site 
class Products{
    async getProducts(){
    try {
        //content from contentful dynamically 
        // let contentful = await client.getEntries({
        //     //content_type: "title"
        // });
        //console.log(contentful);
        

    //products are in product.json file & we're actually fetching it  
    // we can use contentful site as similar to this json format of data
    let result = await fetch('products.json');
    let data = await result.json();
    //using json method sync code in async manner 
    
    //let products = contentful.items;
    let products = data.items;
    products = products.map(item =>{
        const {title,price} = item.fields;
        const {id} = item.sys;
        const image = item.fields.image.fields.file.url;
        return {title,price,id,image}
        });
        //after coming out of map i'm interested to return products
        return products;
        } catch (error) {
        console.log(error);
        }
    }
}

//display products - displaying items returned from Products class & manupulating
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product => { //taking result as a string and foreach product we are adding it to the end of string
            result += ` 
            <!--single product-->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart">add to cart</i>
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!-- end of single product-->
            `;
        });
        //after completion of forecach loop
        //writing onto html page dynamically by productsDOM class using innerHTML write method
        productsDOM.innerHTML = result;
    }

    getBagButtons(){
        const buttons = [...document.querySelectorAll(".bag-btn")];  //by default it will be saved in nodelist datastructure , using ... (spread operator)we are making it to be stored in an array
        buttonsDOM = buttons; //store all the buttons in an array & if we dont use that spread operator there will be issue while using find() method as it works on arrays but not an nodelist
        buttons.forEach(button =>{
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true;
            }
                button.addEventListener('click',(event)=>{
                event.target.innerText = "In Cart";
                event.target.disabled = true;

                //get product from products using id 
                    let cartItem = {...Storage.getProduct(id),amount: 1};// get everything thats from specific product & using spread operator we're adding an extra element or property to the present object 
                    
                // & add product to the cart
                    cart = [...cart,cartItem]; //spread operator is loading if any products are present in the cart & then add our current product to the cart 

                //save cart in the local storage 
                    Storage.saveCart(cart); //store in local storage
                
                //set cart values & items to be displayed on the cart
                    this.setCartValues(cart);

                //display the cart item
                    this.addCartItem(cartItem);
                
                //show the cart on clicking "add to cart"
                    this.showCart();
                });
        });
    }

    setCartValues(cart){
        let tempTotal=0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price* item.amount;
            itemsTotal += item.amount;
        });

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
        //console.log(cartTotal,cartItems);
    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML=`
        <img src=${item.image} alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
        `;
        cartContent.appendChild(div);
        //console.log(cartContent);
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }

    setupApp(){
        cart = Storage.getCart(); //checks if theres anything in cart if present adds those items in the cart array in the next line 
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click',this.showCart); //to access showCart or just a DOM, no need of ()=>{this.showCart} just this.showCart is enough to point it ,where as to access or point a specific method of a classs we must use call back function as in the case of clearcart
        closeCartBtn.addEventListener('click',this.hideCart);
    }

    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    cartLogic(){
        //clear cart button 
        clearCartBtn.addEventListener('click', () => { //for accessing within the method
            //directly using this.clearCart , this doesn't point function but references button with class clear-cart
            this.clearCart();  
        });
        //cart functionality
        cartContent.addEventListener('click',event =>{
            //console.log(event.target); gives whatever your clicking on ,in console
            if(event.target.classList.contains("remove-item")){
                let removeItem = event.target;
                let id = removeItem.dataset.id; //dataset accessess the attribute
                this.removeItem(id); //just removed from cart not from DOM
                //select parent item and its parent -two steps up for this whatever we grabbed
                cartContent.removeChild(removeItem.parentElement.parentElement);
            }else if(event.target.classList.contains("fa-chevron-up")){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item =>  item.id === id);
                tempItem.amount = tempItem.amount + 1; 
                //firstly update the application too ,i.e  local storage & cart total to get updated so that we dont loose when the page is refreshed
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }else if(event.target.classList.contains("fa-chevron-down")){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item =>  item.id === id);
                if(tempItem.amount>1){
                    tempItem.amount = tempItem.amount - 1;  //firstly update the application too ,i.e  local storage & cart total to get updated so that we dont loose when the page is refreshed
                }
                Storage.saveCart(cart);
                this.setCartValues(cart);
                lowerAmount.previousElementSibling.innerText = tempItem.amount;
            }
        });
    }

    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length>0){
            //if the dom object has any children keep on removing each 
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id );
        this.setCartValues(cart); //update cart values by using modified cart value 
        Storage.saveCart(cart);  //update local storage 
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }

    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

//local storage
class Storage{
    //create static method by which we don't even need to create instance  of it & even then we can acces it from other classes
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products')); //an array
        return products.find(product => product.id === id);
    }
    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) :[];
    }
}

//setting event listener where we gonna kick things off

document.addEventListener("DOMContentLoaded",()=>{
//this is where we gonna call our functions ,i.e after the DOM content being loaded!
const ui = new UI(); //new instance of UI
const products = new Products();
//set up application
ui.setupApp();

//get all products
products.getProducts().then(products => {
    ui.displayProducts(products);
    Storage.saveProducts(products);
}).then(()=>{
    ui.getBagButtons();
    ui.cartLogic();
});


});