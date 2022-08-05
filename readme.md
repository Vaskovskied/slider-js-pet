# Small slider app made with HTML, CSS and JS.

You can [view and test it here](https://vaskovskied.github.io/slider-js-pet/)

### Here is a class to create independent sliders

To create another one you need:

1. Copy the first one markup to another place.
2. Give div.slider whatever id you want.
3. Pass this id to constructor function along with other parameters like that:
   `const myOwnSlider = new Slider(document.querySelector("#my-own-slider"), 2, false, 0.5)`  
   You don't need to do any other work. Only copy markup of my slider, give div.slider element an id, and pass it to a constructor function.
