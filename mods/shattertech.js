//Read not these accursed lines of code, for only madness awaits you here

//In all seriousness, I am really, truly sorry for anyone trying to understand or modify this

elements.h_plasma = {
    color: ["#6f00ff","#996bd9","#6f00ff"],
    behavior: behaviors.DGAS,
    behaviorOn: [
        "M2|M1|M2",
        "CL%5 AND M1|XX|CL%5 AND M1",
        "M2|M1|M2",
    ],
    temp:20000,
    tempLow:5000,
    stateLow: "fire",
    category: "energy",
    state: "gas",
    density: 1,
    //charge: 0.5,
    conduct: 1
};

elements.h_explosion = {
    color: ["#6f00ff","#7f48ff","#6f00ff"],
    behavior: [
        "XX|XX|XX",
        "XX|EX:5>h_plasma|XX",
        "XX|XX|XX",
    ],
    temp: 20000,
    category: "energy",
    state: "gas",
    density: 1000,
    excludeRandom: true,
    noMix: true
};

elements.barrage = {
    color: ["#6a00aa","#7a48aa","#6a00aa"],
    tick: function(pixel) {
        var done = true;
        if (pixel.delay) {
            var delayR = pixel.delay % 1;
            var delay = pixel.delay - delayR;
            if (!(pixelTicks - pixel.start > (pixel.delay||1) && Math.random() < 1-delayR)) {
                done = false;
            }
        }
        if ((Math.random() < 0.75 && done) || pixel.alpha >= 1) {
            explodeAt (pixel.x,pixel.y,30,"bombling,plasma,plasma,plasma,plasma");
            deletePixel(pixel.x,pixel.y);
        }
        if (pixel.delay) {
            pixel.alpha = 1-(Math.max(0,1-(pixelTicks - pixel.start)/pixel.delay))
        }
        doHeat(pixel);
    },
    hardness: 1,
    temp: 20000,
    category: "energy",
    state: "gas",
    //density: 1000,
    excludeRandom: true,
    //movable: false,
    noMix: true
};

elements.bombling = {
    color: ["#6a00aa","#7a48aa","#6a00aa"],
    tick: function(pixel) {
        var quirgle = (Math.floor((Math.random() * 600) + 1));
        if (pixelTicks - pixel.start >= quirgle) {
            doDefaults(pixel);
            explodeAt (pixel.x,pixel.y,10,"h_plasma")
            deletePixel(pixel.x,pixel.y);
        }
        else { doDefaults(pixel); }
    },
    temp: 20000,
    category: "energy",
    state: "gas",
    //density: 1000,
    excludeRandom: true,
    noMix: true
};

elements.timed_nova = {
    color: ["#b8e7ff","#b8e7ff","#b8e7ff"],
    tick: function(pixel) {
        var quirgle = 30;
        if (pixelTicks - pixel.start >= quirgle) {
            doDefaults(pixel);
            changePixel(pixel, "void");
            explodeAt (pixel.x,pixel.y,80,"plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,plasma,molten_iron,molten_uranium,molten_lead,oxygen,molten_sodium,sulfur_gas,neon,chlorine,molten_calcium,molten_nickel,molten_copper,molten_zinc,gallium_gas,molten_potassium");
        }
        else { doDefaults(pixel); }
    },
    behavior: behaviors.WALL,
    temp: 99999999700,
    category: "energy",
    state: "gas",
    density: 1000,
    excludeRandom: true,
    noMix: true
};

elements.charged_blaster = {
    color: ["#9b00ff","#9b4dff","#9b77ff"],
    tick: function(pixel) {
        for (var i = 0; i < 100; i++) {
            var skip = false;
            if (!isEmpty(pixel.x,pixel.y+1,true)) {
                var p = pixelMap[pixel.x][pixel.y+1];
                if (p.element === "charged_blaster") { skip = true; }
                if (p.element === "blaster") { skip = true; }
                if (elements[p.element].hardness !== 1) {
                    deletePixel(p.x,p.y);
                } else if (p.element === "barrier") {
                    if (p.emitted == 1) {
                        var s = pixelMap[p.emitX][p.emitY];
                        if (s.element === "shield_gen") {
                            s.offline = true;
                        }
                    }
                    deletePixel(p.x,p.y);
                }
            }
            if (!tryMove(pixel,pixel.x,pixel.y+1,"h_explosion") && !skip) {
                var coords = circleCoords(pixel.x,pixel.y,2);
                coords.forEach(function(coord){
                    var x = coord.x;
                    var y = coord.y;
                    if (!isEmpty(x,y,true)) {
                        pixelMap[x][y].temp += 10000000;
                        pixelTempCheck(pixelMap[x][y]);
                    }
                })
                changePixel(pixel,"barrage");
                pixel.delay = 30;
                return;
            }
        }
    },
    category: "weapons",
    glow: true,
    state: "solid",
    density: 100000000,
    temp: 20000,
    hardness: 1,
    maxSize: 3,
    cooldown: defaultCooldown,
    excludeRandom: true,
};

elements.key = {
    color: "#808080",
    behavior: behaviors.WALL,
    category: "machines",
    insulate: true,
    state: "solid",
    conduct: 1,
};

elements.emitter = {
    color: "#a8a897",
    behavior: behaviors.WALL,
    tick: function(pixel) {
        if (pixel.charge){
            pixel.buffer = 10;
        }
        if (pixel.buffer){
            if (!pixel.charge) {
                pixel.buffer = pixel.buffer-1;
            }
            if (pixel.spooled < 450){
                pixel.spooled = pixel.spooled+2;
            }
        }
        if (pixel.spooled){
            if (pixel.spooled > 150){
                var r = 150;
            }
            else {
                var r = pixel.spooled;
            }
            var g = 0;
            var b = 255;
            var colored = "rgb("+r+","+g+","+b+")";
            if (isEmpty(pixel.x, pixel.y+1)){
                createPixel("lance", pixel.x, pixel.y+1);
                pixelMap[pixel.x][pixel.y+1].color = colored;
                pixelMap[pixel.x][pixel.y+1].focus = pixel.spooled;
            }
            if (!pixel.buffer){
                pixel.spooled = pixel.spooled-1;
            }
        }
        else{
            doDefaults(pixel);
        }
        if (pixel.spooled < 0){
            pixel.spooled = 0;
        }
        // Cap for spooled #1
        if (pixel.spooled > 450){
            pixel.spooled = 450;
        }
        // Detect if emitter is in contact with key
        if (!isEmpty(pixel.x,pixel.y-1) && !outOfBounds(pixel.x, pixel.y-1)){
          if (pixelMap[pixel.x][pixel.y-1].element === "key"){
            pixel.detectUp = true;
          }
          else{
            pixel.detectUp = false;
          }
        }
        else {
          pixel.detectUp = false;
        }
        if (!isEmpty(pixel.x+1,pixel.y) && !outOfBounds(pixel.x+1, pixel.y)){
          if (pixelMap[pixel.x+1][pixel.y].element === "key"){
            pixel.detectRight = true;
          }
          else{
            pixel.detectRight = false;
          }
        }
        else{
          pixel.detectRight = false;
        }
        if (!isEmpty(pixel.x-1,pixel.y) && !outOfBounds(pixel.x-1, pixel.y)){
          if (pixelMap[pixel.x-1][pixel.y].element === "key"){
            pixel.detectLeft = true;
          }
          else {
            pixel.detectLeft = false;
          }
        }
        else{
          pixel.detectLeft = false;
        }
        // Cap for spooled #2
        if (pixel.detectUp == false && pixel.detectRight == false && pixel.detectLeft == false){
          if (pixel.spooled > 150){
            pixel.spooled = 150;
          }
        }
        else if (!pixel.buffer){
          if (pixel.spooled > 150){
            pixel.spooled = 150;
          }
        }
        // Make the emiiter change color depending on spooled
        if (pixel.spooled >= 150){
            if (pixel.spooled == 150){
                pixel.color = "rgb(150,0,255)";
            }
            else if (pixel.spooled > 150){
                var r2 = (100+(pixel.spooled/3));
                var g2 = 0;
                var b2 = 255-(((pixel.spooled-150)/300)*255);
                pixel.color = "rgb("+r2+","+g2+","+b2+")";
            }
            if (pixel.spooled == 450) {
                changePixel(pixel,"charged_blaster");
                pixel.charge = 0;
            }
        }
        else{
            pixel.color = "#a8a897";
        }
        if (!pixel.spooled<150 && !pixel.spooled>0){
            pixel.spooled = 0;
        }
    },
    delay: 30,
    //colorOn: "#ebebc3",
    movable: false,
    category: "machines",
    tempHigh: 6000,
    stateHigh: ["explosion"],
    state: "solid",
    conduct: 1,
    breakInto: "explosion"
};

elements.lance = {
    color: ["#0000ff","#005eff"],
    focus: 0,
    tick: function(pixel) {
        var x = pixel.x;
        var colored = pixel.color;
        if (pixel.focus >=150){
          var focused = 900;
          if (pixel.focus > 160){
            var overload = true;
          }
          else {
            var overload = false;
          }
        }
        else {
            var focused = pixel.focus;
        }
        for (var y = pixel.y; y < height+1; y++) {
            if (outOfBounds(x, y)) {
                if (isEmpty(x, y-1)) { createPixel("smoke", x, y-1); }
                break;
            }
            if (!isEmpty(x+1, y) && !outOfBounds(x+1, y) && focused == 900) {
                p = pixelMap[x+1][y].element;
                if (p !== "lance" && p !== "emitter" && p !== "portal_in" && p !== "portal_out" && elements[p].state !== "gas") {
                  pixelMap[x+1][y].temp += 1000;
                  pixelTempCheck(pixelMap[x+1][y]);
                }
            }
            if (!isEmpty(x-1, y) && !outOfBounds(x-1, y) && focused == 900) {
                p = pixelMap[x-1][y].element;
                if (p !== "lance" && p !== "emitter" && p !== "portal_in" && p !== "portal_out" && elements[p].state !== "gas") {
                  pixelMap[x-1][y].temp += 1000;
                  pixelTempCheck(pixelMap[x-1][y]);
                }
            }
            if (isEmpty(x, y)) {
                if (Math.random() > 0.05) { continue }
                createPixel("flash", x, y);
                pixelMap[x][y].color = colored;
                pixelMap[x][y].temp = 3500;
                pixelMap[x][y].delay = (y - pixel.y) / 8;
            }
            else {
                if (elements[pixelMap[x][y].element].isGas) { continue }
                if (pixelMap[x][y].element === "portal_out") { continue }
                if (pixelMap[x][y].element === "portal_in") { break }
                if (elements[pixelMap[x][y].element].id === elements.lance.id) {
                    pixelMap[x][y].temp = 3500;
                    break;
                }
                if (focused){
                  pixelMap[x][y].temp += (100 + focused);
                  if (elements[pixelMap[x][y].element].hardness == 1){
                    pixelTempCheck(pixelMap[x][y]);
                    break
                  }
                  if (focused == 900){
                    if (overload == true){
                      if (elements[pixelMap[x][y].element].hardness != 1){
                        if (Math.random() >= elements[pixelMap[x][y].element].hardness || elements[pixelMap[x][y].element].hardness == null){
                          var newPixel = pixelMap[x][y];
                          if (pixelMap[x][y].element === "c_utility"){
                            changePixel(newPixel,"pulse");
                          } else {
                            deletePixel(x,y);
                          }
                          break;
                        }
                      }
                    }
                    else {
                      if (elements[pixelMap[x][y].element].hardness < 0.5){
                        if (Math.random() >= elements[pixelMap[x][y].element].hardness){
                          deletePixel(x,y);
                          break;
                        }
                      }
                      else if (elements[pixelMap[x][y].element].hardness == null){
                          deletePixel(x,y);
                          break;
                      }
                    }
                  }
                }
                else {
                    pixelMap[x][y].temp += 100;
                }
                pixelTempCheck(pixelMap[x][y]);
                break;
            }
        }
        deletePixel(pixel.x, pixel.y);
    },
    temp: 3500,
    category: "energy",
    state: "gas",
    density: 1,
    excludeRandom: true,
    noMix: true,
    insulate: true,
};

elements.efuse = {
    color: "#825d38",
    tick: function(pixel) {
        var quirgle = 5;
        if (pixelTicks - pixel.start >= quirgle) {
            doDefaults(pixel);
            deletePixel(pixel.x,pixel.y)
        }
        else { doDefaults(pixel); }
        if (pixel.charge) {
            changePixel(pixel,"flash");
            pixel.charge = 0;
        }
    },
    movable: false,
    tempHigh: 500,
    stateHigh: "fire",
    burn: 100,
    burnTime: 1,
    fireElement: "flash",
    burnInto: "flash",
    category: "machines",
    state: "solid",
    density: 1000,
    conduct: 1,
    ignoreConduct:["ecloner","sensor","fusebox"]
};

elements.fusebox = {
    color: "#725c38",
    behavior: behaviors.WALL,
    behaviorOn: [
        "XX|CR:efuse|XX",
        "CR:efuse|XX|CR:efuse",
        "XX|CR:efuse|XX",
    ],
    category: "machines",
    conduct: 1,
    ignoreConduct: ["efuse"],
    temp: 20,
};

elements.conduit = {
    color: "#660066",
    onSelect: function() {
        logMessage("Draw a conduit, wait for walls to appear, then erase the exit hole. The conduit will burn out when broken.");
    },
    tick: function(pixel) {
        if (!pixel.detection){
          pixel.detection = [
            0,0,0,
            0,0,0,
            0,0,0
          ];
        }
        if (!pixel.primed){
          pixel.primed = false;
        }
        if (pixel.stage === 1 || !pixel.stage){
          pixel.color = "#414c4f";
        }
        if (!pixel.stage && pixelTicks-pixel.start > 60) {
            for (var i = 0; i < squareCoords.length; i++) {
                var coord = squareCoords[i];
                var x = pixel.x+coord[0];
                var y = pixel.y+coord[1];
                if (!isEmpty(x,y,true) && elements[pixelMap[x][y].element].movable) {
                    deletePixel(x,y)
                }
                if (isEmpty(x,y)) {
                    createPixel("pipe_wall",x,y);
                }
            }
            for (var dexx = 0; dexx < 3; dexx++){
              for (var dexy = 0; dexy < 3; dexy++){
                var x = (pixel.x + (dexx-1));
                var y = (pixel.y + (dexy-1));
                var dexi = (dexy + (3*dexx));
                if (!isEmpty(x,y,true)){
                  if (pixelMap[x][y].element === "conduit" || pixelMap[x][y].element === "c_utility"){
                    pixel.detection[dexi] = 1;
                  }
                }
              }
            }
            pixel.stage = 1;
        }
        else if (pixel.stage === 1 && pixelTicks-pixel.start > 70) { //uninitialized
            for (var i = 0; i < adjacentCoords.length; i++) {
                var coord = adjacentCoords[i];
                var x = pixel.x+coord[0];
                var y = pixel.y+coord[1];
                if (isEmpty(x,y)) {
                  pixel.stage = 2; //blue
                  pixel.color = pixelColorPick(pixel,"#660066");
                  for (var dexx = 0; dexx < 3; dexx++){
                    for (var dexy = 0; dexy < 3; dexy++){
                      var checkx = (pixel.x + (dexx-1));
                      var checky = (pixel.y + (dexy-1));
                      var dexi = (dexy + (3*dexx));
                      if (!isEmpty(checkx,checky,true)){
                        if (pixelMap[checkx][checky].element === "conduit" || pixelMap[checkx][checky].element === "c_utility"){
                          pixel.detection[dexi] = 1;
                        }
                      }
                    }
                  }
                  break;
                }
            }
        }
        else if (pixel.stage > 1 && pixel.stage < 5 && pixelTicks % 3 === pixel.stage-2) { //initialized
            for (var i = 0; i < squareCoords.length; i++) {
                var coord = squareCoords[i];
                var x = pixel.x+coord[0];
                var y = pixel.y+coord[1];
                if (!isEmpty(x,y,true)) {
                  if (pixelMap[x][y].element === "conduit"){
                    var newPixel = pixelMap[x][y];
                    if (newPixel.stage === 1) {
                        var newColor;
                        switch (pixel.stage) {
                            case 2: newPixel.stage = 3; newColor = "#660066"; break; //green
                            case 3: newPixel.stage = 4; newColor = "#660066"; break; //red
                            case 4: newPixel.stage = 2; newColor = "#660066"; break; //blue
                        }
                        newPixel.color = pixelColorPick(newPixel,newColor);
                    }
                  }
                }
            }
            for (var dexx = 0; dexx < 3; dexx++){
              for (var dexy = 0; dexy < 3; dexy++){
                var x = (pixel.x + (dexx-1));
                var y = (pixel.y + (dexy-1));
                var dexi = (dexy + (3*dexx));
                if (!isEmpty(x,y,true)) {
                  if (pixelMap[x][y].element === "conduit" || pixelMap[x][y].element === "c_utility"){
                    pixel.detection[dexi] = 1;
                  }
                  else if (pixel.detection[dexi] > 0){
                    if (pixel.primed == true){
                      pixel.detection[dexi] = 2;
                    }
                    else{
                      pixel.detection[dexi] = 0;
                    }
                  }
                }
                else if (pixel.detection[dexi] > 0){
                  if (pixel.primed == true){
                    pixel.detection[dexi] = 2;
                  }
                  else {
                    pixel.detection[dexi] = 0;
                  }
                }
                if (dexi == 8){
                  if (pixel.primed == true){
                    if (pixel.detection.includes(2)){
                      pixel.stage = 5;
                      pixel.color = "#360036"
                      pixel.conduct = 0;
                    }
                  }
                  else {
                    pixel.primed = true;
                  }
                }
              }
            }
            shuffleArray(squareCoordsShuffle);
        }
        else if (pixel.stage > 4 && pixelTicks % 3 === pixel.stage-5) { //initialized
            for (var i = 0; i < squareCoords.length; i++) {
                var coord = squareCoords[i];
                var x = pixel.x+coord[0];
                var y = pixel.y+coord[1];
                if (!isEmpty(x,y,true)) {
                  if (pixelMap[x][y].element === "conduit"){
                    var newPixel = pixelMap[x][y];
                    if (newPixel.stage > 1 && newPixel.stage < 5) {
                        var newColor;
                        switch (pixel.stage) {
                            case 5: newPixel.stage = 6; newColor = "#360036"; break; //green
                            case 6: newPixel.stage = 7; newColor = "#360036"; break; //red
                            case 7: newPixel.stage = 5; newColor = "#360036"; break; //blue
                        }
                        newPixel.color = pixelColorPick(newPixel,newColor);
                    }
                  }
                  else if (pixelMap[x][y].element === "c_utility"){
                    var newPixel = pixelMap[x][y];
                    if (newPixel.stage > 1 && newPixel.stage < 5) {
                        var newColor;
                        switch (pixel.stage) {
                            case 5: newPixel.stage = 6; newColor = "#360036"; break; //green
                            case 6: newPixel.stage = 7; newColor = "#360036"; break; //red
                            case 7: newPixel.stage = 5; newColor = "#360036"; break; //blue
                        }
                        newPixel.color = pixelColorPick(newPixel,newColor);
                    }
                  }
                }
            }
            shuffleArray(squareCoordsShuffle);
            if (pixel.burnt = 1){
              changePixel(pixel, "burnt_conduit");
              pixel.charge = 0;
            }
            else {
              pixel.burnt = 1;
            }
        }
        doDefaults(pixel);
    },
    colorOn: "#ff00ff",
    ignoreConduct: ["sensor","efuse","fusebox"],
    conduct: 1,
    category: "machines",
    movable: false,
    forceSaveColor: true,
    hardness: 0,
};


elements.resonant_pulse = {
    color: ["#ff009b","#ff5e9b"],
    tick: function(pixel) {
      if (pixel.charge){
        pixel.det = 1;
      }
      if (pixel.det === 1){
        var coords = circleCoords(pixel.x,pixel.y,3);
        coords.forEach(function(coord){
          var x = coord.x;
          var y = coord.y;
          if (!isEmpty(x,y,true)) {
            if (pixelMap[x][y].element === "c_utility"){
              pixelMap[x][y].stage = 8;
            }
          }
        })
        explodeAt (pixel.x,pixel.y,5,"purplectric");
        deletePixel(pixel.x,pixel.y);
      }
    },
    category: "weapons",
    state: "gas",
    glow: true,
    conduct: 1,
    temp: 3500,
    excludeRandom: true,
    noMix: true,
    movable: false
};

elements.pulse = {
    color: ["#6f00ff","#7f48ff","#6f00ff"],
    behavior: [
        "XX|XX|XX",
        "XX|EX:5>purplectric|XX",
        "XX|XX|XX",
    ],
    temp: 20,
    category: "energy",
    state: "gas",
    density: 1000,
    excludeRandom: true,
    noMix: true
};

elements.purplectric = {
    color: "#ff2f9b",
    behavior: [
        "CL%2.5|CL%2.5 AND SH|CL%2.5",
        "CL%2.5 AND SH|SH%5 AND DL%25|CL%2.5 AND SH",
        "M1%15 AND CL%3|M1%50 AND CL%7.5 AND SH|M1%15 AND CL%3",
    ],
    charge: 3,
    category: "energy",
    state: "gas",
    density: 2.1,
    insulate: true,
    ignoreAir: true,
    ignore: ["shocker"],
    ignoreConduct: ["shocker"]
},
  
elements.c_utility = {
    color: "#660066",
    colorOn: "#ff00ff",
    onSelect: function() {
        logMessage("Draw a conduit, wait for walls to appear, then erase the exit hole. The conduit will burn out when broken.");
    },
    tick: function(pixel) {
        if (!pixel.detection){
          pixel.detection = [
            0,0,0,
            0,0,0,
            0,0,0
          ];
        }
        if (!pixel.primed){
          pixel.primed = false;
        }
        if (!pixel.stage && pixelTicks-pixel.start > 60) {
            for (var dexx = 0; dexx < 3; dexx++){
              for (var dexy = 0; dexy < 3; dexy++){
                var x = (pixel.x + (dexx-1));
                var y = (pixel.y + (dexy-1));
                var dexi = (dexy + (3*dexx));
                if (!isEmpty(x,y,true)){
                  if (pixelMap[x][y].element === "conduit" || pixelMap[x][y].element === "c_utility"){
                    pixel.detection[dexi] = 1;
                  }
                }
              }
            }
            pixel.stage = 1;
        }
        else if (pixel.stage === 1 && pixelTicks-pixel.start > 70) { //uninitialized
            for (var i = 0; i < adjacentCoords.length; i++) {
                var coord = adjacentCoords[i];
                var x = pixel.x+coord[0];
                var y = pixel.y+coord[1];
                pixel.stage = 2; //blue
                pixel.color = pixelColorPick(pixel,"#660066");
                for (var dexx = 0; dexx < 3; dexx++){
                  for (var dexy = 0; dexy < 3; dexy++){                      
                    var checkx = (pixel.x + (dexx-1));
                    var checky = (pixel.y + (dexy-1));
                    var dexi = (dexy + (3*dexx));
                    if (!isEmpty(checkx,checky,true)){
                      if (pixelMap[checkx][checky].element === "conduit" || pixelMap[checkx][checky].element === "c_utility"){
                        pixel.detection[dexi] = 1;
                      }
                    }
                  }
                }
            }
        }
        else if (pixel.stage > 1 && pixel.stage < 5){
          if (pixelTicks % 3 === pixel.stage-2) { //initialized
              for (var i = 0; i < squareCoords.length; i++) {
                var coord = squareCoords[i];
                var x = pixel.x+coord[0];
                var y = pixel.y+coord[1];
                if (!isEmpty(x,y,true)) {
                  if (pixelMap[x][y].element === "conduit" || pixelMap[x][y].element === "c_utility"){
                    var newPixel = pixelMap[x][y];
                      if (newPixel.stage === 1) {
                          var newColor;
                          switch (pixel.stage) {
                              case 2: newPixel.stage = 3; newColor = "#660066"; break; //green
                              case 3: newPixel.stage = 4; newColor = "#660066"; break; //red
                              case 4: newPixel.stage = 2; newColor = "#660066"; break; //blue
                            }
                          newPixel.color = pixelColorPick(newPixel,newColor);
                      }
                    }
                  }
              }
              for (var dexx = 0; dexx < 3; dexx++){
                for (var dexy = 0; dexy < 3; dexy++){
                  var x = (pixel.x + (dexx-1));
                  var y = (pixel.y + (dexy-1));
                  var dexi = (dexy + (3*dexx));
                  if (!isEmpty(x,y,true)) {
                    if (pixelMap[x][y].element === "conduit" || pixelMap[x][y].element === "c_utility"){
                      pixel.detection[dexi] = 1;
                    }
                    else if (pixel.detection[dexi] > 0){
                      if (pixel.primed == true){
                        pixel.detection[dexi] = 2;
                      }
                      else{
                        pixel.detection[dexi] = 0;
                      }
                    }
                  }
                  else if (pixel.detection[dexi] > 0){
                    if (pixel.primed == true){
                      pixel.detection[dexi] = 2;
                    }
                    else {
                      pixel.detection[dexi] = 0;
                    }
                  }
                  if (dexi == 8){
                    if (pixel.primed == true){
                      if (pixel.detection.includes(2)){
                        pixel.stage = 5;
                        pixel.color = "#360036"
                        pixel.conduct = 0;
                      }
                    }
                    else {
                      pixel.primed = true;
                    }
                  }
                }
              }
              shuffleArray(squareCoordsShuffle);
          }
          if (pixel.stage === 2){
            for (var i = 0; i < adjacentCoords.length; i++) {
              var coords = adjacentCoords[i];
              var x = pixel.x + coords[0];
              var y = pixel.y + coords[1];
              if (!isEmpty(x,y,true)) {
                var sensed = pixelMap[x][y];
                if (pixelMap[x][y].element !== "flash"){
                  if (sensed.con || elements[sensed.element].movable && elements.sensor.ignore.indexOf(sensed.element) === -1) {
                    pixel.charge = 5;
                    break;
                  }
                }
              }
            }
          }
          if (pixel.stage === 3){
            for (var i = 0; i < squareCoords.length; i++) {
              var coord = squareCoords[i];
              var x = pixel.x+coord[0];
              var y = pixel.y+coord[1];
              if (!isEmpty(x,y,true)) {
                var newPixel = pixelMap[x][y];
                if (newPixel.insulate !== true){
                  newPixel.temp -= 10;
                  pixelTempCheck(newPixel);
                }
              }
            }
          }
          if (pixel.stage === 4){
            var coordsToShock = [
              [pixel.x, pixel.y+1],
              [pixel.x, pixel.y-1],
              [pixel.x+1, pixel.y],
              [pixel.x-1, pixel.y],
            ]
            for (var i = 0; i < coordsToShock.length; i++) {
              var x = coordsToShock[i][0];
              var y = coordsToShock[i][1];
              if (!isEmpty(x,y,true)) {
                var newpixel = pixelMap[x][y];
                if (elements[newpixel.element].conduct) {
                  if (pixelMap[x][y].element === "c_utility"){
                    if (pixelMap[x][y].stage != 4){
                      newpixel.charge = 1;
                    }
                  }
                  else {
                    newpixel.charge = 1;
                  }
                }
              }
            }
          }
        }
        else if (pixel.stage > 4 && pixelTicks % 3 === pixel.stage-5) { //dead
            for (var i = 0; i < squareCoords.length; i++) {
                var coord = squareCoords[i];
                var x = pixel.x+coord[0];
                var y = pixel.y+coord[1];
                if (!isEmpty(x,y,true)) {
                  if (pixelMap[x][y].element === "conduit" || pixelMap[x][y].element === "c_utility"){
                    var newPixel = pixelMap[x][y];
                    if (newPixel.stage > 1 && newPixel.stage < 5) {
                        var newColor;
                        switch (pixel.stage) {
                            case 5: newPixel.stage = 6; newColor = "#360036"; break; //green
                            case 6: newPixel.stage = 7; newColor = "#360036"; break; //red
                            case 7: newPixel.stage = 5; newColor = "#360036"; break; //blue
                        }
                        newPixel.color = pixelColorPick(newPixel,newColor);
                    }
                  }
                }
                else if (!outOfBounds(x,y)){
                  createPixel("purplectric",x,y);
                }
            }
            shuffleArray(squareCoordsShuffle);
            if (pixel.burnt = 1){
              changePixel(pixel, "burnt_conduit");
              pixel.charge = 0;
            }
            else {
              pixel.burnt = 1;
            }
        }
        else if (pixel.stage > 7 && pixelTicks % 3 === pixel.stage-8) { //resonating
            for (var i = 0; i < squareCoords.length; i++) {
                var coord = squareCoords[i];
                var x = pixel.x+coord[0];
                var y = pixel.y+coord[1];
                if (!isEmpty(x,y,true)) {
                  if (pixelMap[x][y].element === "c_utility"){
                    var newPixel = pixelMap[x][y];
                    if (newPixel.stage > 1 && newPixel.stage < 5) {
                        var newColor;
                        switch (pixel.stage) {
                            case 8: newPixel.stage = 9; newColor = "#ff009b"; break; //green
                            case 9: newPixel.stage = 10; newColor = "#ff009b"; break; //red
                            case 10: newPixel.stage = 8; newColor = "#ff009b"; break; //blue
                        }
                        newPixel.color = pixelColorPick(newPixel,newColor);
                    }
                  }
                }
                else if (!outOfBounds(x,y)){
                  createPixel("purplectric",x,y);
                }
            }
            shuffleArray(squareCoordsShuffle);
            if (pixel.burnt = 1){
              if ((Math.random() * 8) < 7){
                changePixel(pixel, "burnt_conduit");
              }
              else {
                changePixel(pixel, "resonant_pulse");
                pixel.det = 1;
              }
              pixel.charge = 0;
            }
            else {
              pixel.burnt = 1;
            }
        }
        if (pixel.stage === 3){
          pixel.color = "#4d0084"
          pixel.colorOn = "#9b00ff"
        }
        if (pixel.stage === 2){
          if (pixel.temp <= 10000){
            if (pixel.temp >= 1000){
              if (pixel.temp <= 7000){
                var tempGlowR = Math.round(153*((pixel.temp-1000)/9000));
              }
              else {
                var tempGlowR = Math.round(153-(((pixel.temp)-7000)/30));
              }
              var tempGlowB = Math.round(153*((pixel.temp-1000)/9000));
            }
            else {
              var tempGlowR = 0;
              var tempGlowB = 0;
            }
            var r = (102 + tempGlowR);
            var g = 0;
            var b = (102 + tempGlowB);
            var colored = "rgb("+r+","+g+","+b+")";
            pixel.color = colored;
          }
          else if (pixel.temp > 10000){
            pixel.color = "#9b00ff";
            if (pixel.shatter < 3 || pixel.shatter > 0){
              if (pixel.shatter < 3 && pixel.shatter >= 0){
                pixel.shatter += 1;
              }
            } else {
              pixel.shatter = 0;
              pixel.shattered = 0;
            }
          }
          if (pixel.shatter === 3){
            if (pixel.shattered === 1){
              changePixel(pixel,"pulse");
            }
            else {
              pixel.shattered = 1;
            }
          }
        }
        doDefaults(pixel);
    },
    ignoreConduct: ["sensor","efuse","fusebox","conduit"],
    conduct: 1,
    category: "machines",
    movable: false,
    forceSaveColor: true,
    hardness: 0.99,
};

elements.burnt_conduit = {
  color: "#360036",
  behavior: behaviors.WALL,
  conduct: 0,
  category: "machines",
};

elements.imploder = {
    color: "#533653",
    tick: function(pixel) {
        if ((!pixel.gap) || (pixel.gap < 0)){
          pixel.gap = 1;
        }
        if (pixel.trigger) {
            if (pixel.stage >= 0){
                var coords
                if (pixel.stage >= 1) {
                  coords = ovalRingCoords(pixel.x,pixel.y,pixel.stage,pixel.stage,pixel.gap);
                } else {
                  coords = circleCoords(pixel.x,pixel.y,1);
                }
                coords.forEach(function(coord){
                    var x = coord.x;
                    var y = coord.y;
                    if (!isEmpty(x,y,true)) {
                        var p = pixelMap[x][y];
                        if (p.element === "imploder" || p.element === "h_plasma" || p.element === "h_explosion") {
                            return;
                        }
                        if (elements[p.element].hardness != 1) {
                            changePixel(p, "h_explosion");
                        }
                        if (p.del || !elements[p.element].movable) { return }
                        tryMove(p,p.x,p.y-1);
                    } else if (isEmpty(x,y) && !outOfBounds(x,y)) {
                        createPixel("h_explosion",x,y);
                    }
                })
            }
            if (pixel.stage < 0) {
                changePixel(pixel,"h_explosion");
                return;
            }
            if (pixel.stage > 0 && pixel.collapse === true){
              pixel.stage--;
            }
        }
        else if (!tryMove(pixel,pixel.x,pixel.y+1)) {
            pixel.stage = 15;
            pixel.collapse = true;
            pixel.trigger = 1;
        }
    },
    category: "weapons",
    state: "solid",
    density: 100000000,
    maxSize: 1,
    cooldown: defaultCooldown,
    excludeRandom: true,
};

elements.shield_gen = {
    color: "#a8a897",
    tick: function(pixel) {
      
        //mostly setup code here
        if (!pixel.trigger){
            pixel.trigger = 1;
            pixel.gap = 3;
            pixel.xStage = 15;
            pixel.yStage = 15;
            pixel.offline = false;
            pixel.health = 100;
            pixel.timer = 0;
            pixel.heat = 0;
            pixel.syncCheck = 0;
            pixel.fTrig = true;
        }
        if ((!pixel.gap) || (pixel.gap < 0) || (pixel.gap > 5)){
            pixel.gap = 3;
        }
        if ((pixel.xStage < 0) || (pixel.xStage > 40)){
            pixel.xStage = 15;
        }
        if ((pixel.yStage < 0) || (pixel.yStage > 40)){
            pixel.yStage = 15;
        }
        if (pixel.heat == 0 && pixel.health < 100) {
            if ((pixel.health + 5) > 100) {
                pixel.health = 100;
            } else {
                pixel.health += 5;
            }
        } else if (pixel.heat > 0) {
            pixel.heat -= 1;
        }
        if (pixel.health <= 0) {
            pixel.offline = true;
        }
        if (pixel.offline === true && pixel.timer == 0) {
            pixel.health = 100;
            pixel.heat = 0;
            pixel.timer = 60;
            pixel.offline = false;
        }
        if (pixel.storageRX != pixel.xStage) {
            pixel.syncCheck = 0;
            pixel.storageRX = pixel.xStage;
        }
        if (pixel.yStage != pixel.storageRY) {
            pixel.syncCheck = 0;
            pixel.storageRY = pixel.yStage;
        }
        if (pixel.x != pixel.storageX) {
            pixel.syncCheck = 0;
            pixel.storageX = pixel.x;
        }
        if (pixel.y != pixel.storageY) {
            pixel.syncCheck = 0;
            pixel.storageY = pixel.y;
        }
        
        //the part that manages the shield
        var coords = [];
        if (pixel.syncCheck != 9) {
            coords = ovalRingCoords(pixel.x,pixel.y,pixel.xStage,pixel.yStage,pixel.gap);
        } else {
            coords = ovalCoords(pixel.x,pixel.y,(pixel.xStage + pixel.gap),(pixel.yStage + pixel.gap));
        }
        coords.forEach(function(coord){
            var x = coord.x;
            var y = coord.y;
            if (!outOfBounds(x,y)) {
                var p = pixelMap[x][y];
                if (pixel.syncCheck == 10) {
                    if (isEmpty(x,y) && pixel.timer == 0) {
                        createPixel("barrier",x,y);
                    } else if ((!isEmpty(x,y)) && pixelMap[x][y].element === "barrier") {
                        if (pixel.timer == 0) {
                            p.emitted = 1;
                            p.emitX = pixel.x;
                            p.emitY = pixel.y;
                            p.timer = 5;
                        }
                    }
                } else if (pixel.syncCheck == 9) {
                    if ((!isEmpty(x,y)) && pixelMap[x][y].element === "barrier") {
                        if (p.emitted == 1) {
                            var p2 = pixelMap[p.emitX][p.emitY];
                            if (!outOfBounds(p2.x,p2.y) && !isEmpty(p2.x,p2.y)) {
                                if (p2.element === "shield_gen" && p2.syncCheck == 10) {
                                    var f = p2.fociLocOut;
                                    var resonate = false;
                                    if (findFociDistance(p.x,f[0],f[2],p.y,f[1],f[3]) <= f[4]) {
                                        resonate = true;
                                    }
                                    if (resonate == true) {
                                        changePixel(pixel,"plasma");
                                    }
                                }
                            }
                        }
                    } else if ((!isEmpty(x,y)) && p.element === "shield_gen") {
                        if (p.x != pixel.x || p.y != pixel.y) {
                            changePixel(pixel,"plasma");
                        }
                    }
                }
            }
        })
        
        //find the foci for the shield, to be used by other stuff
        if (pixel.syncCheck < 10 && pixel.syncCheck >= 0) {
            pixel.syncCheck++;
        } else if (pixel.syncCheck > 10) {
            pixel.syncCheck = 10;
        }
        if (pixel.syncCheck == 9 || pixel.fTrig == true) {
            pixel.fTrig = false;
            pixel.fociLocIn = [0,0,0,0,0];
            pixel.fociLocOut = [0,0,0,0,0];
            var s = findFoci(pixel.x,pixel.y,pixel.xStage,pixel.yStage,pixel.gap);
            var x = pixel.x;
            var y = pixel.y;
            if (s[4] == 1) {
                pixel.fociLocIn = [(x+s[0]),y,(x-s[0]),y,s[1],"x"];
                pixel.fociLocOut = [(x+s[2]),y,(x-s[2]),y,s[3],"x"];
            } else {
                pixel.fociLocIn = [x,(y+s[0]),x,(y-s[0]),s[1],"y"];
                pixel.fociLocOut = [x,(y+s[2]),x,(y-s[2]),s[3],"y"];
            }
            if (!storageList.shield_gen) {storageList.shield_gen = {};}
            var tempVal = {x: pixel.x,y: pixel.y};
            var templength = 0;
            if (isObjValDupe(storageList.shield_gen,tempVal) == false) {
                for (let z in storageList.shield_gen) {
                    templength++;
                }
                storageList.shield_gen[templength] = tempVal;
            }
            logMessage(templength);
        }
        if (pixel.timer > 0) {
            pixel.timer--;
        }
    },
    category: "machines",
    state: "solid",
    maxSize: 1,
    excludeRandom: true,
    insulate: true,
    movable: false,
};

elements.barrier = {
    color: ["#ff00ff","#000000","#ff00ff","#000000","#ff00ff"],
    tick: function(pixel) {
        if (pixel.start === pixelTicks) {
            pixel.color = pixelColorPick(pixel,"#ff00ff");
            pixel.timer = 5;
        }
        var t = pixelTicks/2+pixel.x+pixel.y;
        var r = Math.floor(127*Math.sin(t/1.5));
        pixel.alpha = Math.max(0,r/127);
        if (pixel.emitted == 1) {
            if (pixel.timer > 0) {
                if ((!outOfBounds(pixel.emitX,pixel.emitY)) && (!isEmpty(pixel.emitX,pixel.emitY))) {
                    if (pixelMap[pixel.emitX][pixel.emitY].timer == 0 && pixelMap[pixel.emitX][pixel.emitY].offline == true) {
                        changePixel(pixel,"purplectric");
                    }
                }
            }
        }
        if (pixel.timer <= 0 || !pixel.timer) {
            deletePixel(pixel.x,pixel.y);
        } else {
            pixel.timer--;
        }
    },
    onPlace: behaviors.DO_TICK,
    category: "special",
    hardness: 1,
    insulate: true,
    movable: false,
};

elements.portal_in = {
	color: "#ff9a00",
	tick: function(pixel) {
		// if (Math.random() > 0.1) return;
		if (!ticktemp.portal_out) ticktemp.portal_out = {};
		if (!ticktemp.portal_out_s) ticktemp.portal_out_s = {};
		let channel = parseInt(pixel.channel) || 0;
		if (!ticktemp.portal_out[channel]) {
			ticktemp.portal_out[channel] = currentPixels.filter((p) => {
				return elements[p.element].id === elements.portal_out.id && (
					isEmpty(p.x,p.y+1) || isEmpty(p.x,p.y-1) ||
					isEmpty(p.x+1,p.y) || isEmpty(p.x-1,p.y)
				) &&
					(parseInt(p.channel) || 0) === parseInt(channel)
			});
		}
		if (!ticktemp.portal_out_s[channel]) {
			ticktemp.portal_out_s[channel] = currentPixels.filter((p) => {
				return elements[p.element].id === elements.portal_out.id && 
				(parseInt(p.channel) || 0) === parseInt(channel)
			});
		}
		if (ticktemp.portal_out_s[channel].length) {
			if (pixel.charge) {
				let portal_out = choose(ticktemp.portal_out_s[channel]);
				if (portal_out.del) return;
				if (pixel.charge && !portal_out.charge && !portal_out.chargeCD) {
					portal_out.charge = pixel.charge;
				}
			}
		};
		if (ticktemp.portal_out[channel].length) {
			shuffleArray(squareCoordsShuffle);
			let r;
			for (var i = 0; i < squareCoordsShuffle.length; i++) {
				var coord = squareCoordsShuffle[i];
				var x = pixel.x+coord[0];
				var y = pixel.y+coord[1];
				if (!isEmpty(x,y,true) && elements[pixelMap[x][y].element].movable) {
					r = pixelMap[x][y];
					break;
				}
			}
			if (r !== undefined) {
				let portal_out = choose(ticktemp.portal_out[channel]);
				if (portal_out.del) return;
				if (r !== undefined) {
					shuffleArray(squareCoordsShuffle);
					for (var j = 0; j < squareCoordsShuffle.length; j++) {
						var coord2 = squareCoordsShuffle[j];
						var x2 = portal_out.x+coord2[0];
						var y2 = portal_out.y+coord2[1];
						if (isEmpty(x2,y2)) {
							if (r.drag) {
								r.drag = false;
								tryMove(r,x2,y2);
								r.drag = true;
							}
							else tryMove(r,x2,y2);
						}
						break;
					}
				}
			}
		}
		doElectricity(pixel);
	},
	properties: { channel:0 },
	renderer: renderPresets.BORDER,
	hoverStat: function(pixel) { return pixel.channel },
	grain:0,
	category:"machines",
	insulate:true,
	movable:false,
	hardness:0.75,
	conduct:1,
	emit:true
};

function findFoci(x,y,width,height,gap) {
    //for index 4 of the returned list, 1 means horizontal and 2 means vertical
    var f;
    var d;
    var dex;
    var foci = [0,0,0,0,0];
    if (width >= height) {
        for(let i = 0; i <= gap; i += gap) {
            f = Math.pow((Math.pow((width + i), 2) - Math.pow((height + i), 2)), (1/2));
            d = (2*width)+(2*i);
            dex = 2*(i/gap);
            foci[dex] = f;
            foci[dex+1] = d;
        }
        foci[4] = 1;
    } else {
        for(let i = 0; i <= gap; i += gap) {
            f = Math.pow((Math.pow((height + i), 2) - Math.pow((width + i), 2)), (1/2));
            d = (2*height)+(2*i);
            dex = 2*(i/gap);
            foci[dex] = f;
            foci[dex+1] = d;
        }
        foci[4] = 2;
    }
    return foci;
};

function findFociDistance(x1,x2,x3,y1,y2,y3) {
    var distance1 = Math.pow((Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2)), (1/2));
    var distance2 = Math.pow((Math.pow((x3-x1), 2) + Math.pow((y3-y1), 2)), (1/2));
    var totalDistance = distance1+distance2;
    return totalDistance;
};

function ovalCoords(x,y,xRadius,yRadius) {
  var coords = [];
  for (let i = Math.max(0, x - xRadius); i <= Math.min(width, x + xRadius); i++) {
	  for (let j = Math.max(0, y - yRadius); j <= Math.min(height, y + yRadius); j++) {
		  if ((Math.pow(i - x, 2)/Math.pow(xRadius, 2)) + (Math.pow(j - y, 2)/Math.pow(yRadius, 2)) <= 1) {
			  coords.push({x: i,y: j});
		  }
		}
	}
  return coords;
};

function ovalRingCoords(x,y,xRadius,yRadius,thick) {
  var tXRadius = xRadius + thick;
  var tYRadius = yRadius + thick;
  var coords = [];
  for (let i = Math.max(0, x - tXRadius); i <= Math.min(width, x + tXRadius); i++) {
	  for (let j = Math.max(0, y - tYRadius); j <= Math.min(height, y + tYRadius); j++) {
			if ((Math.pow(x - i, 2)/Math.pow(xRadius, 2)) + (Math.pow(y - j, 2)/Math.pow(yRadius, 2)) >= 1) {
			  if ((Math.pow(x - i, 2)/Math.pow(tXRadius, 2)) + (Math.pow(y - j, 2)/Math.pow(tYRadius, 2)) <= 1) {
			    if(!(Math.abs(x - i) == xRadius && y == j) && !(Math.abs(y - j) == yRadius && x == i)) {
				      coords.push({x: i,y: j});
			    }
			  }
			}
		}
	}
  return coords;
};

function isObjValDupe(obj,vals) {
    var s = [];
    var temp = [];
    var tempcon = true;
    var con = false;
    var message;
    for (let x in vals) {
        s.push(x);
    }
    for (let x in obj) {
        temp = [];
        tempcon = true;
        for (let y in obj[x]) {
          	temp.push(y);
        }
        if (temp.length == s.length) {
            temp.sort();
            s.sort();
            for (let z in temp) {
                if (temp[z] != s[z]) {tempcon = false;}
            }
        }
        if (tempcon == true && con == false) {
            con = true;
            for (let f in s) {
                message = vals[s[f]];
                if (vals[s[f]] != obj[x][s[f]]) {con = false;}
            }
        }
    }
    return con;
};

explodeAt = function(x,y,radius,fire="fire") {
    // if fire contains , split it into an array
    if (fire.indexOf(",") !== -1) {
        fire = fire.split(",");
    }
    var coords = circleCoords(x,y,radius);
    var power = radius/10;
    var shieldCloseCheck = false;
    var shieldFarCheck
    var bypass = false;
    var sCC = [];
    var sFC = [];
    if (storageList.shield_gen) {
        for (let d in storageList.shield_gen) {
            var dx = storageList.shield_gen[d].x;
            var dy = storageList.shield_gen[d].y;
            if (isEmpty(dx,dy)) {continue;}
            var dPixel = pixelMap[dx][dy];
            var dFIn = [];
            var dFOut = [];
            if (dPixel.element === "shield_gen" && dPixel.syncCheck == 10){
                if (dPixel.timer == 0) {
                    dFIn = dPixel.fociLocIn;
                    dFOut = dPixel.fociLocOut;
                    if (radius >= 10) {
                        var rdIn = [0,0];
                        var rILoc = [];
                        var rOLoc = [];
                        var smallRad;
                        var largeRad;
                        if (dFOut[5] === "y") {
                            smallRad = dPixel.xStage;
                            largeRad = dPixel.yStage;
                        } else {
                            smallRad = dPixel.yStage;
                            largeRad = dPixel.xStage;
                        }
                        for (i = 0; i <= (2*radius); i+= (2*radius)) {
                            var j = i - radius;
                            var k = i/(2*radius);
                            rdIn[k] = (Math.pow((Math.pow((largeRad + dPixel.gap + j),2) - Math.pow((smallRad + dPixel.gap + j),2)), (1/2)));
                        }
                        if (dFOut[5] == "y") {
                            rILoc = [dPixel.x,(dPixel.y+rdIn[0]),dPixel.x,(dPixel.y-rdIn[0])];
                            rOLoc = [dPixel.x,(dPixel.y+rdIn[1]),dPixel.x,(dPixel.y-rdIn[1])];
                        } else {
                            rILoc = [(dPixel.x+rdIn[0]),dPixel.y,(dPixel.x-rdIn[0]),dPixel.y];
                            rOLoc = [(dPixel.x+rdIn[1]),dPixel.y,(dPixel.x-rdIn[1]),dPixel.y];
                        }
                        var fODistance = findFociDistance(x,rOLoc[0],rOLoc[2],y,rOLoc[1],rOLoc[3]);
                        var fIDistance = findFociDistance(x,rILoc[0],rILoc[2],y,rILoc[1],rILoc[3]);
                        if (fODistance < (dFOut[4]+(2*radius))) {
                            if (fIDistance > (dFIn[4]-(2*radius)) || (radius > smallRad)) {
                                if (dPixel.health > 0) {
                                    dPixel.health -= (Math.pow(10,(power-1)));
                                }
                                dPixel.heat = 60;
                            }
                        }
                    }
                    if (radius <= 30) {
                        if (findFociDistance(x,dFIn[0],dFIn[2],y,dFIn[1],dFIn[3]) <= dFIn[4]) {
                            sCC.push({x: dPixel.x,y: dPixel.y,fx1: dFIn[0],fy1: dFIn[1],fx2: dFIn[2],fy2: dFIn[3],d: dFIn[4]});
                            shieldCloseCheck = true;
                        } else {
                            sFC.push({x: dPixel.x,y: dPixel.y,fx1: dFOut[0],fy1: dFOut[1],fx2: dFOut[2],fy2: dFOut[3],d: dFOut[4]});
                            shieldFarCheck = true;
                        }
                    }
                }
            }
        }
    }
    //for (var p = 0; p < Math.round(radius/10+1); p++) {
    for (var i = 0; i < coords.length; i++) {
        bypass = false;
        if (radius <= 30 && bypass == false) {
            if (shieldCloseCheck == true) {
                for (var c = 0; c < sCC.length; c++){
                    if (findFociDistance(coords[i].x,sCC[c].fx1,sCC[c].fx2,coords[i].y,sCC[c].fy1,sCC[c].fy2) > sCC[c].d){
                        bypass = true;
                    }
                    if (coords[i].x == sCC[c].x && coords[i].y == sCC[c].y) {
                        bypass = true;
                    }
                }
            }
            if (shieldFarCheck == true) {
                for (var r = 0; r < sFC.length; r++){
                    if (findFociDistance(coords[i].x,sFC[r].fx1,sFC[r].fx2,coords[i].y,sFC[r].fy1,sFC[r].fy2) <= sFC[r].d){
                        bypass = true;
                    }
                }
            }
        }
        if (bypass == true) { continue }
        // damage value is based on distance from x and y
        var damage = Math.random() + (Math.floor(Math.sqrt(Math.pow(coords[i].x-x,2) + Math.pow(coords[i].y-y,2)))) / radius;
        // invert
        damage = 1 - damage;
        if (damage < 0) { damage = 0; }
        damage *= power;
        if (isEmpty(coords[i].x,coords[i].y)) {
            // create smoke or fire depending on the damage if empty
            if (damage < 0.02) { } // do nothing
            else if (damage < 0.2) {
                createPixel("smoke",coords[i].x,coords[i].y);
            }
            else {
                // if fire is an array, choose a random item
                if (Array.isArray(fire)) {
                    createPixel(fire[Math.floor(Math.random() * fire.length)],coords[i].x,coords[i].y);
                }
                else {
                    createPixel(fire,coords[i].x,coords[i].y);
                }
            }
        }
        else if (!outOfBounds(coords[i].x,coords[i].y)) {
            // damage the pixel
            var pixel = pixelMap[coords[i].x][coords[i].y];
            var info = elements[pixel.element];
            if (info.hardness) { // lower damage depending on hardness(0-1)
                if (info.hardness < 1) {
                    // more hardness = less damage, logarithmic
                    damage *= Math.pow((1-info.hardness),info.hardness);
                }
                else { damage = 0; }
            }
            if (damage > 0.9) {
                if (Array.isArray(fire)) {
                    var newfire = fire[Math.floor(Math.random() * fire.length)];
                }
                else {
                    var newfire = fire;
                }
                changePixel(pixel,newfire);
                continue;
            }
            else if (damage > 0.25) {
                if (info.breakInto !== undefined) {
                    breakPixel(pixel);
                    continue;
                }
                else {
                    if (Array.isArray(fire)) {
                        var newfire = fire[Math.floor(Math.random() * fire.length)];
                    }
                    else {
                        var newfire = fire;
                    }
                    if (elements[pixel.element].onBreak !== undefined) {
                        elements[pixel.element].onBreak(pixel);
                    }
                    changePixel(pixel,newfire);
                    continue;
                }
            }
            if (damage > 0.75 && info.burn) {
                pixel.burning = true;
                pixel.burnStart = pixelTicks;
            }
            pixel.temp += damage*radius*power;
            pixelTempCheck(pixel);
        }
    }
};

elements.sensor.ignoreConduct = ["wire"];
elements.pipe.hardness = 0;
elements.portal_out.hardness = 0.75;
elements.ewall.insulate = true;
elements.fuse.movable = false;

runEveryTick(function () {
    if (storageList.shield_gen) {
        var placehold = [];
        var exclude = false;
        for (let z in storageList.shield_gen) {
            exclude = false;
            for (let h in storageList.shield_gen[z]) {if (h != "x" && h != "y") {exclude = true;}}
            var x1;
            var y1;
            if ((!storageList.shield_gen[z].x) || (!storageList.shield_gen[z].y)) {exclude = true;} else {
                x1 = storageList.shield_gen[z].x;
                y1 = storageList.shield_gen[z].y;
                if (isEmpty(x1,y1)) {exclude = true;}
                else if (pixelMap[x1][y1].element !== "shield_gen") {exclude = true;}
            }
            if (exclude == false) {
              placehold.push({x: storageList.shield_gen[z].x,y: storageList.shield_gen[z].y});
            }
        }
        storageList.shield_gen = {};
        for (let z in placehold) {
            storageList.shield_gen[z] = placehold[z];
        }
        return;
    } else {return;}
});

runAfterLoad(function() {
    storageList = {};
});