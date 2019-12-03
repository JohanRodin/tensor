
let touchend;
window.addEventListener('load', () => {
   
    const canvas = document.getElementById('sketchpad');

    const context = canvas.getContext('2d');
    let canvasOffset = getOffsetSum(canvas);

    const footprint = {
        width: 32,
        height: 32
    };

    let isRecognized = false;
    const zoom = 10;

    const clearer = function clearer () {
        // commented out to keep the normalized grayscale image
        //context.clearRect(0,0,footprint.width*zoom,footprint.height*zoom);
        console.log("Clearer!");
        isRecognized = false;
    };

    clearer();

    function getOffsetSum(elem) {
        let top=0;
        let left=0;
        while(elem) {
            top = top + parseInt(elem.offsetTop)
            left = left + parseInt(elem.offsetLeft)
            elem = elem.offsetParent
        }

        return {top, left}
    }

    // create a drawer which tracks touch movements
    const drawer = {
        isDrawing: false,
        touchstart(coors) {
            context.beginPath();
            context.lineWidth = 5;
            context.lineCap="round";
            context.moveTo(coors.x-canvasOffset.left, coors.y-canvasOffset.top);
            this.isDrawing = true;
        },
        touchmove(coors) {
            if (this.isDrawing) {
				try {
					clearTimeout(touchend)
				} catch(e) {

				}
                if (isRecognized) {
                    clearer();
                }
                context.lineTo(coors.x-canvasOffset.left, coors.y-canvasOffset.top);
                context.stroke();
            }
        },
        touchend(coors) {
            if (this.isDrawing) {
                this.touchmove(coors);
                this.isDrawing = false;
            }

			touchend = setTimeout(() => {
				recognizeN().then(() => {
					clearer();
				})

			}, 300)
        }
    };
    // create a function to pass touch events and coordinates to drawer
    function draw(event) {
        let type = null;
        // map mouse events to touch events
        switch(event.type){
            case "mousedown":
                    event.touches = [];
                    event.touches[0] = {
                        pageX: event.pageX,
                        pageY: event.pageY
                    };
                    type = "touchstart";
            break;
            case "mousemove":
                    event.touches = [];
                    event.touches[0] = {
                        pageX: event.pageX,
                        pageY: event.pageY
                    };
                    type = "touchmove";
            break;
            case "mouseup":
                    event.touches = [];
                    event.touches[0] = {
                        pageX: event.pageX,
                        pageY: event.pageY
                    };
                    type = "touchend";
            break;
        }

        // touchend clear the touches[0], so we need to use changedTouches[0]
        let coors;
        if(event.type === "touchend") {
            coors = {
                x: event.changedTouches[0].pageX,
                y: event.changedTouches[0].pageY
            };
        }
        else {
            // get the touch coordinates
            coors = {
                x: event.touches[0].pageX,
                y: event.touches[0].pageY
            };
        }
        type = type || event.type
        // pass the coordinates to the appropriate handler
        drawer[type](coors);
    }

    // detect touch capabilities
    const touchAvailable = ('createTouch' in document) || ('ontouchstart' in window);

    // attach the touchstart, touchmove, touchend event listeners.
    if(touchAvailable){
        canvas.addEventListener('touchstart', draw, false);
        canvas.addEventListener('touchmove', draw, false);
        canvas.addEventListener('touchend', draw, false);
    }
    // attach the mousedown, mousemove, mouseup event listeners.
    else {
        canvas.addEventListener('mousedown', draw, false);
        canvas.addEventListener('mousemove', draw, false);
        canvas.addEventListener('mouseup', draw, false);
    }

    window.addEventListener("resize", event => {
        event.preventDefault();
        canvasOffset = getOffsetSum(canvas);
    }, false);

    // prevent elastic scrolling
    document.body.addEventListener('touchmove', event => {
        event.preventDefault();
    }, false); // end body.onTouchMove


    // Number recognizer
    function recognizeN() {
		return new Promise((resolve, reject) => {
            if (isRecognized) return;
            let imgData = context.getImageData(0, 0, 320, 320);

            // my test
            let imgData2 = context.getImageData(0, 0, 320, 320);
            console.log(JSON.stringify(imgData2));

            grayscaleImg = imageDataToGrayscale(imgData);
            const boundingRectangle = getBoundingRectangle(grayscaleImg, 0.01);
            const trans = centerImage(grayscaleImg); // [dX, dY] to center of mass

            console.log(grayscaleImg);
            console.log(boundingRectangle);
            console.log(trans);


            const canvasCopy = document.createElement("canvas");
            canvasCopy.width = imgData.width;
            canvasCopy.height = imgData.height;
            const copyCtx = canvasCopy.getContext("2d");
            const brW = boundingRectangle.maxX+1-boundingRectangle.minX;
            const brH = boundingRectangle.maxY+1-boundingRectangle.minY;
            const scaling = 190 / (brW>brH?brW:brH);
            // scale
            copyCtx.translate(canvas.width/2, canvas.height/2);
            copyCtx.scale(scaling, scaling);
            copyCtx.translate(-canvas.width/2, -canvas.height/2);
            // translate to center of mass
            copyCtx.translate(trans.transX, trans.transY);
        
            // draw back translated image?
            copyCtx.drawImage(context.canvas, 0, 0);

            // now bin image into 10x10 blocks (giving a 28x28 image)
            imgData = copyCtx.getImageData(0, 0, 320, 320);
            grayscaleImg = imageDataToGrayscale(imgData);
            console.log(grayscaleImg);
/*
            const nnInput = new Array(784);
            const nnInput2 = [];
            for (var y = 0; y < 28; y++) {
	            for (var x = 0; x < 28; x++) {
	                let mean = 0;
	                for (let v = 0; v < 10; v++) {
	                    for (let h = 0; h < 10; h++) {
	                        mean += grayscaleImg[y*10 + v][x*10 + h];
	                    }
	                }
	                mean = (1 - mean / 100); // average and invert
	                nnInput[x*28+y] = (mean - .5) / .5;
	            }
	        }
*/
            const nnInput = new Array(1024);
            const nnInput2 = [];
            for (var y = 0; y < 32; y++) {
                for (var x = 0; x < 32; x++) {
                    let mean = 0;
                    for (let v = 0; v < 10; v++) {
                        for (let h = 0; h < 10; h++) {
                            mean += grayscaleImg[y*10 + v][x*10 + h];
                        }
                    }
                    mean = (1 - mean / 100); // average and invert
                    nnInput[x*32+y] = (mean - .5) / .5;
                }
            }



/*     
            if (true) {
	            context.clearRect(0, 0, canvas.width, canvas.height);
	            context.drawImage(copyCtx.canvas, 0, 0);
	            for (var y = 0; y < 28; y++) {
	                for (var x = 0; x < 28; x++) {
	                    const block = context.getImageData(x * 10, y * 10, 10, 10);
	                    const newVal = 255 * (0.5 - nnInput[x*28+y]/2);
	                    nnInput2.push(Math.round((255-newVal)/255*100)/100);
	                    for (let i = 0; i < 4 * 10 * 10; i+=4) {
	                        block.data[i] = newVal;
	                        block.data[i+1] = newVal;
	                        block.data[i+2] = newVal;
	                        block.data[i+3] = 255;
	                    }
	                    context.putImageData(block, x * 10, y * 10);
	                }
	            }
	        }
*/


            if (true) {
                // this line clears the canvas
                context.clearRect(0, 0, canvas.width, canvas.height);

                context.drawImage(copyCtx.canvas, 0, 0);

               
                for (var y = 0; y < 32; y++) {
                    for (var x = 0; x < 32; x++) {
                        const block = context.getImageData(x * 10, y * 10, 10, 10);
                        const newVal = 255 * (0.5 - nnInput[x*32+y]/2);
                        nnInput2.push(Math.round((255-newVal)/255*100)/100);
                        for (let i = 0; i < 4 * 10 * 10; i+=4) {
                            block.data[i] = newVal;
                            block.data[i+1] = newVal;
                            block.data[i+2] = newVal;
                            block.data[i+3] = 255;
                        }
                        // this clears the canvas too!
                        context.putImageData(block, x * 10, y * 10);
                    }
                }
            }

            function Create2DArray(rows) {
                var arr = [];

                //for (var i=0;i<rows;i++) {
                //    arr = new Array(rows).fill(0).map(() => new Array(32).fill(0));   //new Array(32).fill(new Array(1).fill(42));
                //}

                arr = new Array(rows).fill(0).map(() => new Array(rows).fill(0));
                //console.log("new array: " + arr);
                return arr;
            }

            function create2dArr(x,y) {
                var arr = [];
                for(var i = 0; i < y; i++) {
                    arr.push(Array(x).fill(0));
                }
                return arr; 
            }
            var testingarr = create2dArr(2,2)
            //console.log("New test: " + testingarr[0][0]);

            //console.log("Maries array+ : " + nnInput2);
            // loop through and make 32 rows of 32 long arrays
            var output_str ="";
            var big_counter=0;
            var myArray = Create2DArray(32)// new Array(32);
            for (var y = 0; y < 32; y++) {
                var tmp_arr = [];
                for (var x = 0; x < 32; x++) {
                    tmp_arr.push(new Array(1).fill(Math.round(nnInput2[big_counter]*256))); //*65536
                    output_str += Math.round(nnInput2[big_counter]*256) + " ";
                    //myArray[y][x]=nnInput2[big_counter];
                    big_counter++;
                }
                //console.log(tmp_arr);
                myArray[y]=tmp_arr;
                //console.log(myArray);
            }
            console.log(output_str);
            console.log("Two dims?: " + myArray + ", length: " + nnInput2.length);
            console.log(myArray);
            //console.log("Doing analysis on: " + nnInput2);
            //console.log(JSON.stringify(nnInput2));
            score(myArray);
            //const output = nn(nnInput2);
            //document.getElementById('result').innerText = output.toString();
            isRecognized = true;
			resolve()
        })

    }

}, false); // end window.onLoad


function net(input) {
  var netData = window["netData"]
  for (var i = 1; i < netData.layers.length; i++) {
    var layer = netData.layers[i];
    var output = {};

    for (var id in layer) {
      var node = layer[id];
      var sum = node.bias;

      for (var iid in node.weights) {
        sum += node.weights[iid] * input[iid];
      }
      output[id] = 1 / (1 + Math.exp(-sum));
    }
    input = output;
  }
  return output;
}
function getMax(output) {
  let array = []
  for (let i in output) {
	  array.push(output[i])
  }
  const max = Math.max(...array);
  return array.indexOf(max);
}

function nn(input) {
  var output = net(input);

  return getMax(output);
}






function centerImage(img) {
    var meanX = 0;
    var meanY = 0;
    var rows = img.length;
    var columns = img[0].length;
    var sumPixels = 0;
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < columns; x++) {
            var pixel = (1 - img[y][x]);
            sumPixels += pixel;
            meanY += y * pixel;
            meanX += x * pixel;
        }
    }
    meanX /= sumPixels;
    meanY /= sumPixels;

    var dY = Math.round(rows/2 - meanY);
    var dX = Math.round(columns/2 - meanX);
    return {transX: dX, transY: dY};
}


function getBoundingRectangle(img, threshold) {
    var rows = img.length;
    var columns = img[0].length;
    var minX=columns;
    var minY=rows;
    var maxX=-1;
    var maxY=-1;
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < columns; x++) {
            if (img[y][x] < threshold) {
                if (minX > x) minX = x;
                if (maxX < x) maxX = x;
                if (minY > y) minY = y;
                if (maxY < y) maxY = y;
            }
        }
    }
    return { minY: minY, minX: minX, maxY: maxY, maxX: maxX};
}


function imageDataToGrayscale(imgData) {
    var grayscaleImg = [];
    for (var y = 0; y < imgData.height; y++) {
        grayscaleImg[y]=[];
        for (var x = 0; x < imgData.width; x++) {
            var offset = y * 4 * imgData.width + 4 * x;
            var alpha = imgData.data[offset+3];
            if (alpha == 0) {
                imgData.data[offset] = 255;
                imgData.data[offset+1] = 255;
                imgData.data[offset+2] = 255;
            }
            imgData.data[offset+3] = 255;

            grayscaleImg[y][x] = imgData.data[y*4*imgData.width + x*4 + 0] / 255;
        }
    }
    return grayscaleImg;
}
