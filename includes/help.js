if(window.addEventListener) {
window.addEventListener('load', function () {
  var canvas, context, canvaso, contexto;

  // The active tool instance.
  var tool;
  var tool_default = 'pencil';
  var tool_color = document.getElementById('picker');
  var img;


  function init () {
    // Find the canvas element.
    canvaso = document.getElementById('imageView');
    if (!canvaso) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvaso.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context.
    contexto = canvaso.getContext('2d');
    if (!contexto) {
      alert('Error: failed to getContext!');
      return;
    }

    // Add the temporary canvas.
    var container = canvaso.parentNode;
    canvas = document.createElement('canvas');
    if (!canvas) {
      alert('Error: I cannot create a new canvas element!');
      return;
    }

    canvas.id     = 'imageTemp';
    canvas.width  = canvaso.width;
    canvas.height = canvaso.height;
    container.appendChild(canvas);

    context = canvas.getContext('2d');


    // Add Image uploaded
    var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
    function handleImage(e){
      var reader = new FileReader();
      reader.onload = function(event){
          img = new Image();
          img.onload = function(){
              canvaso.width = img.width;
              canvaso.height = img.height;
              canvas.width = canvaso.width;
              canvas.height = canvaso.height;
              context.drawImage(img,0,0);
          }
          img.src = event.target.result;
      }
      reader.readAsDataURL(e.target.files[0]);     
   }

   // GreyScale Image
   var makeGreyscale = document.getElementById('greyscale');
   makeGreyscale.addEventListener('click', turnGreyScale,false);
   function turnGreyScale() {
  
     var imgd = contexto.getImageData(0, 0, canvas.width, canvas.height);
     var pix = imgd.data;
     for (var i = 0, n = pix.length; i < n; i += 4) {
      var grayscale = pix[i  ] * .3 + pix[i+1] * .59 + pix[i+2] * .11;
      pix[i  ] = grayscale;   // red
      pix[i+1] = grayscale;   // green
      pix[i+2] = grayscale;   // blue
      // alpha
      }

      context.putImageData(imgd, 0, 0);

   }

   // Invert Image
   var makeinvert = document.getElementById('invert');
   makeinvert.addEventListener('click', invertImage,false);
   function invertImage() {
     var imgd = contexto.getImageData(0, 0, canvas.width, canvas.height);
     var pix = imgd.data;
     for (var i = 0, n = pix.length; i < n; i += 4) {
        pix[i  ] = 255 - pix[i];
        pix[i+1] = 255 - pix[i+1];
        pix[i+2] = 255 - pix[i+2]; 
      }
      context.putImageData(imgd, 0, 0);
   }

   // save image
   var saveimg = document.getElementById('save');
   saveimg.addEventListener('click', saveIt, false);
   function saveIt() {
    var c = document.getElementById("imageView");
    var dataString = c.toDataURL("image/png");
    window.open(dataString);

   }
   //  // GreyScale Image
   // var zoomIn = document.getElementById('zoomIn');
   // zoomIn.addEventListener('click', zoomInCanvas,false);
   // function zoomInCanvas() {
   //  alert('hi');
    

   // }

   var temp = document.getElementById('tempt');
   temp.addEventListener('click', tempFunc, false);
   function tempFunc() {
    alert("hi");

   
   }


    // // Width of canvas
    // var canvas_width = document.getElementById('canW');
    // canvas_width.addEventListener('change', function () { 
    //   canvaso.save();
    //   alert(canvas.width);
    //     if(canvas_width.value!="" && canvas_width.value > 0) {
          
    //       canvaso.width = canvas_width.value;
          
    //       //canvas.restore();
    //       alert(canvas.width);
    //     }
    //   }
    // );

    // Length of canvas
    // Get thickness of the tool being used
    var tool_thickness = document.getElementById('thickness');
    tool_thickness.addEventListener('change',ev_thickness_change,false);
    function ev_thickness_change() {
      if(tool_thickness.value == 'thin') {
        context.lineWidth= 1;
      }
      if(tool_thickness.value == 'normal') {
        context.lineWidth= 3;
      }
      if(tool_thickness.value == 'thick') {
        context.lineWidth= 5;
      }
      if(tool_thickness.value == 'thicker') {
        context.lineWidth= 8;
      }
    }

    // Get color of the tool being used

    tool_color = document.getElementById('picker');
    var butt = document.getElementById('chooseIt');
    butt.addEventListener('click', ev_color_change, false);
    function ev_color_change() {
      context.strokeStyle =tool_color.value;
    }

    // Get the tool select input.
    var tool_select = document.getElementById('tool');
    if (!tool_select) {
      alert('Error: failed to get the dtool element!');
      return;
    }
    tool_select.addEventListener('change', ev_tool_change, false);

    // Activate the default tool.
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
  }

  function position(ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }
  }


  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  // The event handler for any changes made to the tool selector.
  function ev_tool_change (ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
    }
  }

  // This function draws the #imageTemp canvas on top of #imageView, after which 
  // #imageTemp is cleared. This function is called each time when the user 
  // completes a drawing operation.
  function img_update () {
    contexto.drawImage(canvas, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // This object holds the implementation of each drawing tool.
  var tools = {};
  

  // Eraser
  tools.eraser = function () {
    var tool = this;
    this.started = false;
    context.strokeStyle="#FFF";
    

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev._x, ev._y);
        context.stroke();
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The drawing pencil.
  tools.pencil = function () {
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev._x, ev._y);
        context.stroke();
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // Rectangle Full
  tools.rectFull = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var x = Math.min(ev._x,  tool.x0),
          y = Math.min(ev._y,  tool.y0),
          w = Math.abs(ev._x - tool.x0),
          h = Math.abs(ev._y - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!w || !h) {
        return;
      }
      
      context.fillStyle = tool_color.value;
      context.fillRect(x, y, w, h);

    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // Rectangle outline 
  tools.rect = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var x = Math.min(ev._x,  tool.x0),
          y = Math.min(ev._y,  tool.y0),
          w = Math.abs(ev._x - tool.x0),
          h = Math.abs(ev._y - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!w || !h) {
        return;
      }

      context.strokeRect(x, y, w, h);

    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The line tool.
  tools.line = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(tool.x0, tool.y0);
      context.lineTo(ev._x,   ev._y);
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

 

  init();

}, false); 

}
