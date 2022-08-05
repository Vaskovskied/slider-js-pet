"use strict";
const stylesRegExp = /[-0-9.]+(?=(px|vh|vw|vmax|vmin|em|rem|%))/g;

// with this class you can create a couple of independent sliders
class Slider {
  posInit = 0;
  posX1 = 0;
  posX2 = 0;
  posThreshold;
  posFinal = 0;
  isGrabbing = false;

  slider;
  sliderList;
  sliderTrack;

  sliderStyle;
  sliderTrackStyle;
  slideStyle;

  slideIndex = 0;
  slideIndexMax;

  setRefreshedSliderValues;

  constructor(
    sliderHTMLelement,
    speedCoeff = 2,
    isSpeedCoeffMobileSensetive = true,
    posThreshold = 0.5
  ) {
    this.slider = sliderHTMLelement;
    this.sliderList = this.slider.firstElementChild;
    this.sliderTrack = this.sliderList.firstElementChild;

    this.sliderStyle = getComputedStyle(this.slider);
    this.sliderTrackStyle = getComputedStyle(this.sliderTrack);
    this.slideStyle = getComputedStyle(this.sliderTrack.firstElementChild);

    this.slideIndexMax = this.getSlideIndexMax();

    this.setRefreshedSliderValues = function () {
      this.slideWidth = +this.slideStyle.width.match(stylesRegExp)[0];
      this.slidesGap = +this.sliderTrackStyle.gap.match(stylesRegExp)[0];
      this.slidesAmount = +this.sliderStyle.getPropertyValue("--items");

      this.posThreshold = this.slideWidth * posThreshold;

      if (isSpeedCoeffMobileSensetive) {
        this.speedCoeff =
          window.outerWidth > 1024 ? speedCoeff : speedCoeff * 2;
      } else {
        this.speedCoeff = speedCoeff;
      }
    };

    this.setRefreshedSliderValues();

    this.sliderTrack.style.transform = `translate3d(0px, 0px, 0px)`;
  }

  swipeAction(e) {
    if (!this.isGrabbing) return;
    const event = getEventType(e);

    const style = this.sliderTrack.style.transform;
    const transform = +style.match(stylesRegExp)[0];

    if (event.clientX - this.posX1 > 0) {
      // if I moving backwars (left)
      if (transform - this.posX2 / this.speedCoeff > 0) {
        return;
      }
    } else {
      // if I moving forwards (right)
      if (
        Math.abs(transform - this.posX2 / this.speedCoeff) >
        this.sliderTrack.offsetWidth -
          this.slidesAmount * (this.slideWidth + this.slidesGap) -
          this.slidesGap
      ) {
        return;
      }
    }

    this.posX2 = (this.posX1 - event.clientX) * this.speedCoeff;
    this.posX1 = event.clientX;

    this.sliderTrack.style.transform = `translate3d(${
      transform - this.posX2
    }px, 0px, 0px)`;
  }

  swipeEnd(e) {
    if (!this.isGrabbing) return;

    this.isGrabbing = false;
    this.slider.classList.remove("grabbing");

    this.posFinal = (this.posInit - this.posX1) * this.speedCoeff;

    if (this.posInit < this.posX1) {
      if (
        Math.abs(this.posFinal) >
        Math.floor(
          Math.abs(this.posFinal) / (this.slideWidth + this.slidesGap)
        ) *
          (this.slideWidth + this.slidesGap) +
          this.posThreshold +
          this.slidesGap
      ) {
        this.slideIndex -=
          Math.floor(
            Math.abs(this.posFinal) / (this.slideWidth + this.slidesGap)
          ) + 1;
      } else {
        this.slideIndex -= Math.floor(
          Math.abs(this.posFinal) / (this.slideWidth + this.slidesGap)
        );
      }
    }

    if (this.posInit > this.posX1) {
      if (
        Math.abs(this.posFinal) >
        Math.floor(
          Math.abs(this.posFinal) / (this.slideWidth + this.slidesGap)
        ) *
          (this.slideWidth + this.slidesGap) +
          this.posThreshold +
          this.slidesGap
      ) {
        this.slideIndex +=
          Math.floor(
            Math.abs(this.posFinal) / (this.slideWidth + this.slidesGap)
          ) + 1;
      } else {
        this.slideIndex += Math.floor(
          Math.abs(this.posFinal) / (this.slideWidth + this.slidesGap)
        );
      }
    }

    if (this.slideIndex < 0) {
      this.slideIndex = 0;
    }

    if (this.slideIndex > this.slideIndexMax) {
      this.slideIndex = this.slideIndexMax;
    }

    if (this.posInit !== this.posX1) {
      this.slide();
    }
  }

  swipeStart(e) {
    const event = getEventType(e);
    this.isGrabbing = true;
    this.slider.classList.add("grabbing");

    this.posInit = this.posX1 = event.clientX;
  }

  slide() {
    this.sliderTrack.style.transition = "transform .5s ease-out";
    this.sliderTrack.style.transform = `translate3d(-${
      this.slideIndex * (this.slideWidth + this.slidesGap)
    }px, 0px, 0px)`;
  }

  getSlideIndexMax() {
    return (
      Math.floor(
        (this.sliderTrack.offsetWidth - this.slidesGap) /
          (this.slideWidth + this.slidesGap)
      ) -
      this.slidesAmount +
      1
    );
  }

  onResize() {
    this.setRefreshedSliderValues();
    this.slideIndexMax = this.getSlideIndexMax();
    if (this.slideIndex > this.slideIndexMax) {
      this.slideIndex = this.slideIndexMax;
    }
    this.slide();
  }

  addEventListeners() {
    if (window.PointerEvent) {
      this.slider.addEventListener("pointerdown", (e) => {
        this.swipeStart(e);
      });
      window.addEventListener("pointerup", (e) => {
        this.swipeEnd(e);
      });
      window.addEventListener("pointermove", (e) => {
        this.swipeAction(e);
      });
    } else {
      this.slider.addEventListener("mousedown", (e) => {
        this.swipeStart(e);
      });
      window.addEventListener("mouseup", (e) => {
        this.swipeEnd(e);
      });
      window.addEventListener("mousemove", (e) => {
        this.swipeAction(e);
      });

      this.slider.addEventListener("touchdown", (e) => {
        this.swipeStart(e);
      });
      window.addEventListener("touchup", (e) => {
        this.swipeEnd(e);
      });
      window.addEventListener("touchmove", (e) => {
        this.swipeAction(e);
      });
    }
  }

  start() {
    this.addEventListeners();
  }
}

const slider = new Slider(document.querySelector("#slider"), 2, false, 0.5);

slider.start();

onResizeWidthOnly(() => {
  slider.onResize();
});

function getEventType(e) {
  if (e.type.includes("touch")) {
    return e.touches[0];
  } else {
    return e;
  }
}

// This function is an alternative of window risize event listener.
// For some reasons, default solution don't work properly for me.
function onResizeWidthOnly(a, b) {
  let c = [window.innerWidth];
  return (
    (onresize = function () {
      let d = window.innerWidth,
        e = c.length;
      c.push(d);
      if (c[e] !== c[e - 1]) {
        clearTimeout(b);
        b = setTimeout(a, 50);
      }
    }),
    a
  );
}
