/* -----------------------------------------------
/* How to use? : Check the GitHub README
/* ----------------------------------------------- */

/* To load a config file (particles.json) you need to host this demo (MAMP/WAMP/local)... */

// particlesJS.load('particles-js', 'particles.json', function() {
//   console.log('particles.js loaded - callback');
// });

/**
 * Accordions from details elements
 *
 * Animates native details element in accordion style
 * credit to https://css-tricks.com/how-to-animate-the-details-element-using-waapi/
 * Adjusted slightly to accommodate 'prefers-reduced-motion'
 *
 * Usage:
 * import Accordions from './util/accordions';
 * Accordions.init(options);
 *
 * Options:
 * openDuration: numeral (default: 250),
 * openEase: string (default: 'ease'),
 * closeDuration: numeral (default: 250),
 * closeEase: string (default 'ease-out')
 *
 * Classes:
 * .is-opening: applied during duration of opening of accordion
 * .is-open: applied as soon as a closed accordion is toggled, until accordion has completed closing
 * .is-closing: applied during duration of closing of accordion
 *
 * Events:
 * accordionToggled: will fire when an accordion has completed opening, as well as when it has completed closing
 */






 class Accordion {
  constructor(el, options) {
    // Default Options
    this.defaultOptions = {
      openDuration: 250,
      openEase: "ease",
      closeDuration: 250,
      closeEase: "ease-out"
    };
    this.options = Object.assign({}, this.defaultOptions, options);

    // Create a custom event to fire when an accordion is toggled open/closed
    this.toggleEvent = new CustomEvent("accordionToggled");
    // Store the <details> element
    this.el = el;
    // Store the <summary> element
    this.summary = el.querySelector("summary");
    // Store the <div class="content"> element
    this.content = el.querySelector(".accordion-content");
    // Store the optional <button class="close-accordion"> element
    this.closeButton = el.querySelector(".close-accordion");
    // Store the animation object (so we can cancel it if needed)
    this.animation = null;
    // Store if the element is closing
    this.isClosing = false;
    // Store if the element is expanding
    this.isExpanding = false;
    // Detect user clicks on the summary element
    this.summary.addEventListener("click", (e) => this.onClick(e));
    // Detect user clicks on the close button element
    if (this.closeButton) {
      this.closeButton.addEventListener("click", (e) => this.shrink());
    }
    // Check if user prefers reduced motion
    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
  }

  onClick(e) {
    // Stop default behaviour from the browser
    e.preventDefault();

    // Add an overflow on the <details> to avoid content overflowing
    this.el.style.overflow = "hidden";
    // Check if the element is being closed or is already closed
    if (this.isClosing || !this.el.hasAttribute("open")) {
      this.open();
      // Check if the element is being opened or is already open
    } else if (this.isExpanding || this.el.hasAttribute("open")) {
      this.shrink();
    }
  }

  shrink() {
    // Set the element as "being closed"
    this.isClosing = true;
    this.el.classList.add("is-closing");
    // Store the current height of the element
    const startHeight = `${this.el.offsetHeight}px`;
    // Calculate the height of the summary
    const endHeight = `${this.summary.offsetHeight}px`;

    // If there is already an animation running
    if (this.animation) {
      // Cancel the current animation
      this.animation.cancel();
    }

    // If `prefers-reduced-motion` is not 'reduced', animate it
    if (!this.prefersReducedMotion.matches) {
      // Start the animation
      this.animation = this.el.animate(
        {
          height: [startHeight, endHeight]
        },
        {
          duration: this.options.closeDuration,
          easing: this.options.closeEase
        }
      );
      // Update vars/attributes/classes when animation finishes
      this.animation.onfinish = () => this.onAnimationFinish(false);
      // If the animation is cancelled, isClosing variable is set to false
      this.animation.oncancel = () => (this.isClosing = false);
    } else {
      // If `prefers-reduced-motion` is 'reduced', just update vars/attributes/classes
      this.onAnimationFinish(false);
    }
  }

  open() {
    // Apply a fixed height on the element
    this.el.style.height = `${this.el.offsetHeight}px`;
    // Force the [open] attribute on the details element
    this.el.setAttribute("open", "open");
    // Wait for the next frame to call the expand function
    window.requestAnimationFrame(() => this.expand());
  }

  expand() {
    // Set the element as "being expanding"
    this.isExpanding = true;
    // set the open/opening classes
    this.el.classList.add("is-opening");
    this.el.classList.add("is-open");
    // Get the current fixed height of the element
    const startHeight = `${this.el.offsetHeight}px`;
    // Calculate the open height of the element (summary height + content height)
    const endHeight = `${
      this.summary.offsetHeight + this.content.offsetHeight
    }px`;

    // If there is already an animation running
    if (this.animation) {
      // Cancel the current animation
      this.animation.cancel();
    }

    // If `prefers-reduced-motion` is not 'reduced', animate it
    if (!this.prefersReducedMotion.matches) {
      // Start the animation
      this.animation = this.el.animate(
        {
          height: [startHeight, endHeight]
        },
        {
          duration: this.options.openDuration,
          easing: this.options.openEase
        }
      );
      // Update vars/attributes/classes when animation finishes
      this.animation.onfinish = () => this.onAnimationFinish(true);
      // If the animation is cancelled, isExpanding variable is set to false
      this.animation.oncancel = () => (this.isExpanding = false);
    } else {
      // If `prefers-reduced-motion` is 'reduced', just update vars/attributes/classes
      this.onAnimationFinish(true);
    }
  }

  onAnimationFinish(open) {
    this.animation = false;
    // Set the open attribute and classes based on the `open` parameter
    if (open === true) {
      this.el.setAttribute("open", "open");
    } else {
      this.el.removeAttribute("open");
      this.el.classList.remove("is-open");
    }

    // Fire off the accordionToggle event
    this.el.dispatchEvent(this.toggleEvent);
    // Clear the stored animation
    this.animation = null;
    // Reset isClosing & isExpanding
    this.isClosing = false;
    this.el.classList.remove("is-closing");
    this.isExpanding = false;
    this.el.classList.remove("is-opening");
    // Remove the overflow hidden and the fixed height
    this.el.style.height = this.el.style.overflow = "";
  }
}

const Accordions = {
  init(options) {
    document.querySelectorAll(".accordion").forEach((el) => {
      new Accordion(el, options);
    });
  }
};

// Init the accordions!
Accordions.init();

// Listen for the `accordionToggled` event on the #event-emitter accordion
let eventEmitter = document.getElementById("event-emitter");
eventEmitter.addEventListener("accordionToggled", function () {
  console.log("Accordion Toggled!");
});

/* Otherwise just put the config content (json): */


particlesJS('particles-js',
{
  "particles": {
    "number": {
      "value": 106,
      "density": {
        "enable": false,
        "value_area": 561.194221302933
      }
    },
    "color": {
      "value": "#98c739"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 0.32,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 7,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 5,
        "size_min": 0.1,
        "sync": true
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#98c739",
      "opacity": 0.1763753266952075,
      "width": 1.122388442605866
    },
    "move": {
      "enable": true,
      "speed": 4,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": false,
        "mode": "grab"
      },
      "onclick": {
        "enable": false,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 400,
        "line_linked": {
          "opacity": 1
        }
      },
      "bubble": {
        "distance": 400,
        "size": 40,
        "duration": 2,
        "opacity": 8,
        "speed": 3
      },
      "repulse": {
        "distance": 200,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
}
);