//Read not these accursed lines of code, for only madness awaits you here

//In all seriousness, I am really, truly sorry for anyone trying to understand or modify this

elements.hotter_plasma = {
    color: ["#6f00ff","#996bd9","#6f00ff"],
    behavior: behaviors.DGAS,
    behaviorOn: [
        "M2|M1|M2",
        "CL%5 AND M1|XX|CL%5 AND M1",
        "M2|M1|M2",
    ],
    temp:15000,
    tempLow:5000,
    stateLow: "fire",
    category: "energy",
    state: "gas",
    density: 1,
    //charge: 0.5,
    conduct: 1
};

elements.plasma_burst = {
    color: ["#6f00ff","#7f48ff","#6f00ff"],
    behavior: [
        "XX|XX|XX",
        "XX|EX:5>hotter_plasma|XX",
        "XX|XX|XX",
    ],
    temp: 15000,
    category: "energy",
    state: "gas",
    density: 1000,
    excludeRandom: true,
    noMix: true
};

elements.barrage_spawner = {
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
            barrage(pixel.x,pixel.y,20,10,"hotter_plasma","hotter_plasma");
            deletePixel(pixel.x,pixel.y);
        }
        if (pixel.delay) {
            pixel.alpha = 1-(Math.max(0,1-(pixelTicks - pixel.start)/pixel.delay))
        }
        doHeat(pixel);
    },
    hardness: 1,
    temp: 15000,
    category: "energy",
    state: "gas",
    desc: "Creates a barrage of plasma explosions.<br/>VERY destructive.",
    //density: 1000,
    excludeRandom: true,
    //movable: false,
    cooldown: defaultCooldown,
    noMix: true
};

elements.charged_blaster = {
    color: ["#9b00ff","#9b4dff","#9b77ff"],
    tick: function(pixel) {
        var det1 = 0;
        var det2 = 0;
        for (var i = 0; i < 100; i++) {
            var skip = false;
            if (!isEmpty(pixel.x,pixel.y+1,true)) {
                var p = pixelMap[pixel.x][pixel.y+1];
                if (p.element === "charged_blaster") { skip = true; }
                if (p.element === "blaster") { skip = true; }
                if (elements[p.element].hardness !== 1) {
                    deletePixel(p.x,p.y);
                    if (!elements[p.element].movable && !det1) {det1 = 1;}
                    if (!elements[p.element].movable && det2) {det2 = 0;}
                } else if (p.element === "barrier") {
                    if (p.emitted == 1) {
                        var s = pixelMap[p.emitX][p.emitY];
                        if (s.element === "shield_gen") {
                            s.health = 0;
                        }
                    }
                    deletePixel(p.x,p.y);
                }
            } else if (!outOfBounds(pixel.x,pixel.y+1) && det1 == 1) {det1 = 2;}
            if (!outOfBounds(pixel.x,pixel.y+1) && det1 == 2) {
                det2++;
            }
            if ((!tryMove(pixel,pixel.x,pixel.y+1,"disintegrate") && !skip) || det2 >= 4) {
                changePixel(pixel,"barrage_spawner");
                pixel.delay = 30;
                return;
            }
        }
    },
    category: "weapons",
    glow: true,
    state: "solid",
    desc: "The ultimate bunker-buster.",
    density: 100000000,
    temp: 15000,
    hardness: 1,
    maxSize: 1,
    cooldown: defaultCooldown,
    excludeRandom: true,
};

elements.beam_overclocker = {
    color: "#af6e00",
    behavior: behaviors.WALL,
    category: "components",
    desc: "Strengthens emitters in its network, but allows them to overheat. " +
"The more overclockers are connected, the slower the emitters will heat up.<br/>",
    insulate: true,
    state: "solid",
    hardness: 0.75,
    conduct: 1,
    compType: "emitters"
};

elements.emitter = {
    color: "#a8a897",
    behavior: behaviors.WALL,
    tick: function(pixel) {
        if (pixel.charge){
            pixel.buffer = 10;
        }
        if (pixel.link) {
          if (isEmpty(pixel.link[0],pixel.link[1],true)) {pixel.failsafe = false;}
          else if (pixelMap[pixel.link[0]][pixel.link[1]].element !== "net_core") {pixel.failsafe = false;}
          else if (pixelMap[pixel.link[0]][pixel.link[1]].fault === true) {pixel.failsafe = false;}
        }
        if (!pixel.failsafe) {
          pixel.link = false;
          pixel.overclocked = false;
          pixel.heatup = 0;
          pixel.failsafe = true;
        }
        if (pixel.buffer){
            if (!pixel.charge) {
                pixel.buffer = pixel.buffer-1;
            }
            if (pixel.overclocked === true && pixel.spooled < 450){
                pixel.spooled += 2;
            } else if (pixel.overclocked !== true && pixel.spooled < 150) {
                pixel.spooled += 2;
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
                if (pixel.link != false) {
                  pixelMap[pixel.x][pixel.y+1].link = pixel.link[0].toString() + "." + pixel.link[1].toString();
                }
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
        // Cap for spooled #2
        if (pixel.spooled > 150){
          if (pixel.overclocked != true || (!pixel.buffer)) {
            pixel.spooled = 150;
          } else {
            pixel.temp += pixel.heatup;
            pixelTempCheck(pixel);
          }
        }
        // Make the emitter change color (or go kaboom) depending on spooled
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
    desc: "Creates a destructive beam when charged. Can shoot through shields if on the same network.",
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
            if (!isEmpty(x+1,y,true) && focused == 900) {
                p = pixelMap[x+1][y].element;
                if (pixel.link && p === "barrier" ? pixel.link !== pixelMap[x+1][y].link : true) {
                    if (p !== "lance" && p !== "emitter" && p !== "portal_in" && p !== "portal_out" && elements[p].state !== "gas") {
                        pixelMap[x+1][y].temp += 1000;
                        pixelTempCheck(pixelMap[x+1][y]);
                    }
                }
            }
            if (!isEmpty(x-1,y,true) && focused == 900) {
                p = pixelMap[x-1][y].element;
                if (pixel.link && p === "barrier" ? pixel.link !== pixelMap[x-1][y].link : true) {
                    if (p !== "lance" && p !== "emitter" && p !== "portal_in" && p !== "portal_out" && elements[p].state !== "gas") {
                        pixelMap[x-1][y].temp += 1000;
                        pixelTempCheck(pixelMap[x-1][y]);
                    }
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
                if (pixelMap[x][y].element === "barrier") {
                    if (pixel.link ? pixel.link === pixelMap[x][y].link : false) { continue }
                    else if (focused == 900) {
                        var p1 = pixelMap[x][y];
                        var genCheck = true;
                        if (p1.emitX && p1.emitY) {
                            var p2 = pixelMap[p1.emitX][p1.emitY];
                            if (isEmpty(p2.x,p2.y,true)) {genCheck = false;}
                            else if (p2.element !== "shield_gen") {genCheck = false;}
                            else if (p2.health <= 0 || p2.timer > 1 || p2.syncCheck != 10) {genCheck = false;}
                            if (genCheck == true) {
                                p2.health--;
                                p2.heat = 60;    
                            }
                        }
                   }
                }
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
                          if (pixelMap[x][y].element === "nano_armor"){
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

elements.pulse = {
    color: ["#ff009b","#ff5e9b"],
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
};

elements.net_core = {
    color: "#ff0000",
    onSelect: function() {
        logMessage("When charged, pulls nearby net_link pixels into its network.\nThe network will deactivate if changed or moved.");
    },
    tick: function(pixel) {
        if (!pixel.setup) {
          pixel.setup = 1;
          pixel.overrideVal = Math.random();
          pixel.active = 0;
          pixel.fault = true;
          pixel.compList = {
            shields: [],
            emitters: []
          };
          pixel.augList = {};
          pixel.augCount = {};
          pixel.compUpdate = {};
          pixel.locStore = [pixel.x,pixel.y];
          pixel.detection = [0,0,0,0,0,0,0,0,0];
          pixel.sCHeatup = 0;
        }
        if (pixel.charge && pixel.active === 0) {pixel.active = 10;}
        if (pixel.active === 10) {
            pixel.compList = {shields: [], emitters: []};
            pixel.augList = {};
        }
        if (pixel.fault == false || pixel.active == 10) {
            for (var i = 0; i < squareCoords.length; i++) {
                var coord = squareCoords[i];
                var x = pixel.x+coord[0];
                var y = pixel.y+coord[1];
                var dexi = (coord[0]+1) + 3*(coord[1]+1);
                var check = (pixel.detection[dexi] > 0 ? false : true);
                if (!isEmpty(x,y,true)) {
                    if (pixelMap[x][y].element === "net_link" ) {
                        if (pixel.active == 10) {
                            if (pixel.fault === true) {pixel.fault = false;}
                            pixel.detection[dexi] = 1;
                            pixelMap[x][y].active = 4;
                            pixelMap[x][y].activeStart = pixelTicks;
                            pixelMap[x][y].netConflict = [pixelTicks,pixel.overrideVal];
                            pixelMap[x][y].coreLoc = [pixel.x,pixel.y];
                        } else {
                            if (pixelMap[x][y].active > 0) {check = true;}
                        }
                    }
                }
                if (check == false && pixel.active < 10) {pixel.fault = true;}
            }
        }
        if (pixel.x != pixel.locStore[0] || pixel.y != pixel.locStore[1]) {
            pixel.fault = true;
            pixel.locStore = [pixel.x,pixel.y];
        }
        if (pixel.active > 0) {pixel.active--;}
        pixel.color = (pixel.fault === true ? "#ff0000" : "#00ff00");
        if (pixel.fault === true) {
            pixel.compList = {shields: [],emitters: []};
            pixel.augList = {};
            pixel.augCount = {};
            pixel.compUpdate = {};
            pixel.detection = [0,0,0,0,0,0,0,0,0];
        } else {
          var tempObj = {
            comps: {shields: [], emitters: []},
            augList: {},
            augCount: {}
          };
          for (let a in pixel.augList) {
            for (let b in pixel.augList[a]) {
              var c = pixel.augList[a][b];
              if (!isEmpty(c.x,c.y,true) ? pixelMap[c.x][c.y].element === a : false) {
                if (!tempObj.augList[a]) {tempObj.augList[a] = [];}
                if (!tempObj.augCount[a]) {tempObj.augCount[a] = 0;}
                tempObj.augList[a].push({x: c.x,y: c.y});
                tempObj.augCount[a]++;
              }
            }
            var check = 0;
            if (pixel.augCount[a]) {
              if (!tempObj.augCount[a]) {check = 1;}
              else if (pixel.augCount[a] > tempObj.augCount[a]) {check = 1;}
              else if (pixel.augCount[a] < tempObj.augCount[a]) {check = 2;}
            } else if (tempObj.augCount[a]) {check = 2;}
            if (check == 1) {
              pixel.fault = true;
              break;
            } else if (check == 2) {
              var store = elements[a].compType;
              pixel.compUpdate[store] = true;
            }
            if (a === "shield_charger" && tempObj.augList[a] && pixel.sCHeatup > 0) {
                var heatGen = (100*pixel.sCHeatup*Math.pow(0.8,(tempObj.augCount[a]-1)));
                heatGen = Math.ceil(heatGen/tempObj.augCount[a]);
                if (isNaN(heatGen)) {heatGen = 0;}
                else if (heatGen < 0) {heatGen = 0;}
                for (let b in tempObj.augList[a]) {
                    var p = pixelMap[tempObj.augList[a][b].x][tempObj.augList[a][b].y];
                    p.temp += heatGen;
                    pixelTempCheck(p);
                }
                pixel.sCHeatup = 0;
            }
          }
          if (pixel.fault == false) {
            for (let a in pixel.compList) {
              var type = (a === "shields" ? "shield_gen" : "emitter");
              for (let b in pixel.compList[a]) {
                var c = pixel.compList[a][b];
                if (!isEmpty(c.x,c.y,true) ? pixelMap[c.x][c.y].element === type : false) {
                  tempObj.comps[a].push({x: c.x,y: c.y});
                  if (pixel.compUpdate[a]) {
                    c_u_handler(a,tempObj.augCount,c.x,c.y);
                  }
                }
              }
            }
            pixel.compList = {shields: tempObj.comps.shields,emitters: tempObj.comps.emitters};
            pixel.augList = tempObj.augList;
            pixel.augCount = tempObj.augCount;
            pixel.compUpdate = {};
          }
        }
        if (pixel.devcheck == 1) {
          for (let a in pixel.compList.shields) {
            logMessage(pixel.compList.shields[a].x + "," + pixel.compList.shields[a].y);
          }
          pixel.devcheck = 0;
        }
        doDefaults(pixel);
    },
    conduct: 1,
    category: "machines",
    desc: "When charged, pulls nearby net_links into its network." +
    " Shield gens, emitters, and anything in the components category can also be pulled via net_links, but cannot be directly connected.<br/>",
    movable: false,
    hardness: 0.75,
    forceSaveColor: true,
};
  
elements.net_link = {
    color: "#006666",
    colorOn: "#00ffff",
    onSelect: function() {
        logMessage("Draw a link to connect components and net_core to.");
    },
    tick: function(pixel) {
        if (!pixel.failsafe){
          pixel.detection = [
            0,0,0,
            0,0,0,
            0,0,0
          ];
          pixel.active = 0;
          pixel.failsafe = true;
        }
        if (pixel.active > 0) {
          if (!pixel.coreLoc) {pixel.failsafe = false;}
          else if (isEmpty(pixel.coreLoc[0],pixel.coreLoc[1],true)) {pixel.failsafe = false;}
          else if (pixelMap[pixel.coreLoc[0]][pixel.coreLoc[1]].element !== "net_core") {pixel.failsafe = false;}
        }
        if (pixel.active > 0 && pixel.failsafe == true) {
            for (var a = -1; a < 2; a++) {
              for (var b = -1; b < 2; b++) {
                if (a == 0 && b == 0) {continue;} //skip if looking at self
                var dexi = ((a+1) + 3*(b+1));
                if (!isEmpty(pixel.x+a,pixel.y+b,true)) {
                  var bypass = false;
                  if (pixel.activeStart ? (pixel.activeStart == pixelTicks) : false) {continue;}
                  if (pixel.active < 4) {bypass = true;}
                  var newPixel = pixelMap[pixel.x+a][pixel.y+b];
                  if (newPixel.element === "net_link") {
                    if (newPixel.active == 0 && pixel.detection[dexi] > 0) {pixel.detection[dexi] = 2;}
                    if (bypass == true) {continue;}
                    if (newPixel.active > 1) {
                      if (pixel.coreLoc === newPixel.coreLoc) {continue;}
                      var list1 = [pixel.netConflict[0],pixel.netConflict[1],pixel.coreLoc[0],pixel.coreLoc[1]];
                      var list2 = [newPixel.netConflict[0],newPixel.netConflict[1],newPixel.coreLoc[0],newPixel.coreLoc[1]];
                      var c = 1;
                      for (i = 0; i < 4; i++) {
                        if (c == 1) {
                          if (list1[i] > list2[i]) {c = 2;}
                          else if (list1[i] < list2[i]) {c = 3;}
                        }
                      }
                      if (c != 3) {continue;}
                      var d = pixelMap[newPixel.coreLoc[0]][newPixel.coreLoc[1]];
                      if (d.fault === false) {d.fault = true;}
                    } else if (newPixel.active == 1) {
                      if (pixel.coreLoc[0] == newPixel.coreLoc[0] && pixel.coreLoc[1] == newPixel.coreLoc[1]) {
                        if (pixel.netConflict[0] == newPixel.netConflict[0]) {
                          continue;
                        }
                      } else {
                        var target = pixelMap[newPixel.coreLoc[0]][newPixel.coreLoc[1]];
                        if (target.fault === false) {target.fault = true;}
                      }
                    }
                    pixel.detection[dexi] = 1;
                    newPixel.active = 4;
                    newPixel.activeStart = pixelTicks;
                    newPixel.netConflict = pixel.netConflict;
                    newPixel.coreLoc = pixel.coreLoc;
                  } else {
                    if (pixel.detection[dexi] > 0) {
                        pixel.detection[dexi] = 2;
                        pixel.failsafe = false;
                    } else if (bypass == false) {
                      if (pixel.detection[dexi] > 0) {pixel.detection[dexi] = 2;}
                      else if (elements[newPixel.element].category === "components") {
                        var list = [pixel.coreLoc[0],pixel.coreLoc[1],pixel.netConflict[0]];
                        if (newPixel.netData ? listCompare(list,newPixel.netData) : true) {
                          newPixel.netData = list;
                          var target = pixelMap[pixel.coreLoc[0]][pixel.coreLoc[1]];
                          if (!target.augList[newPixel.element]) {target.augList[newPixel.element] = [];}
                          target.augList[newPixel.element].push({x: pixel.x+a,y: pixel.y+b});
                          if (!target.augCount[newPixel.element]) {target.augCount[newPixel.element] = 0;}
                          target.augCount[elements[newPixel.element].compType]++;
                        }
                      } else if (newPixel.element === "shield_gen") {
                        var list = [pixel.coreLoc[0],pixel.coreLoc[1],pixel.netConflict[0]];
                        if (newPixel.link ? listCompare(list,newPixel.link) : true) {
                          newPixel.link = list;
                          var target = pixelMap[pixel.coreLoc[0]][pixel.coreLoc[1]];
                          target.compList.shields.push({x: pixel.x+a,y: pixel.y+b});
                          target.compUpdate.shields = true;
                        }
                      } else if (newPixel.element === "emitter") {
                        var list = [pixel.coreLoc[0],pixel.coreLoc[1],pixel.netConflict[0]];
                        if (newPixel.link ? listCompare(list,newPixel.link) : true) {
                          newPixel.link = list;
                          var target = pixelMap[pixel.coreLoc[0]][pixel.coreLoc[1]];
                          target.compList.emitters.push({x: pixel.x+a,y: pixel.y+b});
                          target.compUpdate.emitters = true;
                        }
                      }
                    }
                  }
                } else if (pixel.detection[dexi] > 0) {
                  pixel.detection[dexi] = 2;
                }
              }
            }
            if (pixel.active > 1 && pixel.activeStart != pixelTicks) {pixel.active--;}
            if (pixel.detection.includes(2)) {
              if (pixel.active > 0 && pixel.coreLoc) {
                var target = pixelMap[pixel.coreLoc[0]][pixel.coreLoc[1]];
                if (!isEmpty(target.x,target.y,true) ? (target.element === "net_core") : false) {
                  target.fault = true;
                }
              }
              pixel.failsafe = false;
            }
        }
        var newColor = "#006666";
        if (pixel.active === 3) {newColor = "#00ff00";}
        else if (pixel.charge) {newColor = "#00ffff";}
        pixel.color = newColor;
        doDefaults(pixel);
    },
    conduct: 1,
    category: "machines",
    desc: "Used by a net_core to form a network and connect components.",
    movable: false,
    forceSaveColor: true,
    hardness: 0.75,
};

elements.nano_armor = {
    color: "#660066",
    colorOn: "#ff00ff",
    tick: function(pixel) {
        if (!pixel.detection){
          pixel.detection = [
            0,0,0,
            0,0,0,
            0,0,0
          ];
          pixel.primed = false;
          pixel.stage = 1;
          pixel.shatter = 0;
          pixel.shattered = 0;
        }
        if (pixel.stage === 1 && pixelTicks-pixel.start > 70) { //uninitialized
            pixel.stage = 2;
            pixel.color = "#660066";
            for (var a = -1; a < 2; a++) {
                for (var b = -1; b < 2; b++) {
                    if (!isEmpty(pixel.x+a,pixel.y+b,true)) {
                        if (pixelMap[pixel.x+a][pixel.y+b].element === "nano_armor") {
                            var dexi = ((a+1) + 3*(b+1));
                            pixel.detection[dexi] = 1;
                        }
                    }
                }
            }
        }
        else if (pixel.stage === 2){
              for (var a = -1; a < 2; a++) {
                for (var b = -1; b < 2; b++) {
                  if (a == 0 && b == 0) {continue;} //skip if looking at self
                  var dexi = ((a+1) + 3*(b+1));
                  if (!isEmpty(pixel.x+a,pixel.y+b,true)) {
                    var newPixel = pixelMap[pixel.x+a][pixel.y+b];
                    if (newPixel.element === "nano_armor") {
                      pixel.detection[dexi] = 1;
                    } else {
                      if (pixel.detection[dexi] > 0) {pixel.detection[dexi] = (pixel.primed === true ? 2 : 0);}
                    }
                  } else if (pixel.detection[dexi] > 0 && !outOfBounds(pixel.x+a,pixel.y+b)) {
                    pixel.detection[dexi] = (pixel.primed === true ? 2 : 0);
                  }
                }
              }
              if (pixel.primed === false) {pixel.primed = true;}
              var newColor = "#660066";
              if (pixel.active > 1 && pixel.activeStart != pixelTicks) {pixel.active--;}
              if (pixel.detection.includes(2)) {
                pixel.stage = 3;
                newColor = "#360036";
              } else if (pixel.temp > 10000) {
                newColor = "#9b00ff"
                if (pixel.shatter < 3 && pixel.shatter >= 0) {pixel.shatter++;}
                if (pixel.shatter == 3) {
                  if (pixel.shattered == 1) {changePixel(pixel,"pulse");}
                  else {pixel.shattered = 1;}
                }
              } else {
                if (pixel.active == 3) {newColor = "#00ff00";}
                else {
                  pixel.shatter = 0;
                  pixel.shattered = 0;
                  var colorVals = [102,0,102];
                  if (pixel.temp >= 1000) {
                    colorVals[2] += Math.round(153*((pixel.temp-1000)/9000));
                    if (pixel.temp >= 7000) {colorVals[0] += Math.round(153-((pixel.temp-7000)/30));}
                    else {colorVals[0] += Math.round(153*((pixel.temp-1000)/9000));}
                  }
                  newColor = "rgb("+colorVals[0]+","+colorVals[1]+","+colorVals[2]+")";
                }
              }
              pixel.color = newColor;
        }
        else if (pixel.stage > 2 && pixelTicks % 3 === pixel.stage-3) { //dead
            for (var i = 0; i < squareCoords.length; i++) {
                var coord = squareCoords[i];
                var x = pixel.x+coord[0];
                var y = pixel.y+coord[1];
                if (!isEmpty(x,y,true)) {
                  if (pixelMap[x][y].element === "nano_armor"){
                    var newPixel = pixelMap[x][y];
                    if (newPixel.stage === 2) {
                        switch (pixel.stage) {
                            case 3: newPixel.stage = 4; break;
                            case 4: newPixel.stage = 5; break;
                            case 5: newPixel.stage = 3; break;
                        }
                        newPixel.color = pixelColorPick(newPixel,"#360036");
                    }
                  }
                }
                else if (!outOfBounds(x,y)){
                  createPixel("purplectric",x,y);
                }
            }
            shuffleArray(squareCoordsShuffle);
            if (pixel.burnt = 1){
              if ((Math.random() * 8) < 7) {
                changePixel(pixel, "broken_armor");
              } else {
                changePixel(pixel, "pulse");
              }
              pixel.charge = 0;
            }
            else {
              pixel.burnt = 1;
            }
        }
        doDefaults(pixel);
    },
    conduct: 1,
    category: "special",
    desc: "Extremely durable, and connects with adjacent armor pixels.<br/>" +
    "Burns out if an adjacent armor pixel is moved/destroyed, or above 10000 degrees.<br/>",
    movable: false,
    forceSaveColor: true,
    hardness: 0.99,
};

elements.broken_armor = {
  color: "#360036",
  behavior: behaviors.WALL,
  conduct: 0,
  category: "special",
};

elements.imploder = {
    color: "#533653",
    tick: function(pixel) {
        if ((!pixel.gap) || (pixel.gap < 0)){
          pixel.gap = 2;
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
                        if (p.element === "imploder" || p.element === "hotter_plasma" || p.element === "plasma_burst") {
                            return;
                        }
                        if (elements[p.element].hardness != 1) {
                            changePixel(p, "plasma_burst");
                        }
                        if (p.del || !elements[p.element].movable) { return }
                        tryMove(p,p.x,p.y-1);
                    } else if (isEmpty(x,y) && !outOfBounds(x,y)) {
                        createPixel("plasma_burst",x,y);
                    }
                })
            }
            if (pixel.stage <= 0) {
                changePixel(pixel,"plasma_burst");
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
    hardness: 1,
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
            pixel.health = 100;
            pixel.timer = 0;
            pixel.heat = 0;
            pixel.syncCheck = 0;
            pixel.nestObj = [];
            pixel.threshold = 0;
            pixel.boosted = false;
            pixel.link = false;
        }
        if ((!pixel.gap) || (pixel.gap < 0) || (pixel.gap > 5)){
            pixel.gap = 3;
        }
        if ((!pixel.xStage) || (pixel.xStage < 0) || (pixel.xStage > 40)){
            pixel.xStage = 15;
        }
        if ((!pixel.yStage) || (pixel.yStage < 0) || (pixel.yStage > 40)){
            pixel.yStage = 15;
        }
        if (pixel.link != false) {
          var p = pixelMap[pixel.link[0]][pixel.link[1]];
          var check = false;
          if (isEmpty(pixel.link[0],pixel.link[1],true)) {check = true;}
          else if (p.element !== "net_core") {check = true;}
          else if (p.fault != false) {check = true;}
          if (check == true) {
            pixel.link = false;
            pixel.threshold = 0;
            pixel.boosted = false;
          }
        }
        if (pixel.health <= 0) {
            pixel.health = 100;
            pixel.heat = 0;
            pixel.timer = 60;
        }
        if (pixel.health < 100 && pixel.timer > 0) {pixel.health = 100;}
        if (pixel.boosted == true && pixel.link != false && pixel.health < 100) {
            var regVal = 5;
            if (pixel.health > 95) {regVal = 100 - pixel.health;}
            pixel.health += regVal;
            pixelMap[pixel.link[0]][pixel.link[1]].sCHeatup += regVal;
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
        if (pixel.syncCheck == 9) {
            if (!storageList.shield_gen) {storageList.shield_gen = {};}
            var tempVal = {x: pixel.x,y: pixel.y};
            if (pixel.x == 0 || pixel.y == 0) {
              tempVal.onBorder = true;
            }
            var templength = 0;
            if (isObjValDupe(storageList.shield_gen,tempVal) == false) {
                for (let z in storageList.shield_gen) {
                    templength++;
                }
                storageList.shield_gen[templength] = tempVal;
            }
            var outList = [];
            var inList = [];
            for (let A in storageList.shield_gen) {
                if (!storageList.shield_gen[A].x || !storageList.shield_gen[A].y) {
                  if (!storageList.shield_gen[A].onBorder) {continue;}
                }
                if (isEmpty(storageList.shield_gen[A].x,storageList.shield_gen[A].y)) {continue;}
                var targetloc = pixelMap[storageList.shield_gen[A].x][storageList.shield_gen[A].y];
                if (targetloc.element !== "shield_gen") {continue;}
                if ((pixel.xStage + pixel.gap) <= targetloc.xStage) {
                    if ((pixel.yStage + pixel.gap) <= targetloc.yStage) {
                        outList.push({x: storageList.shield_gen[A].x,y: storageList.shield_gen[A].y});
                    }
                }
                if ((targetloc.xStage + targetloc.gap) <= pixel.xStage) {
                    if ((targetloc.yStage + targetloc.gap) <= pixel.yStage) {
                        if (Math.pow((targetloc.x-pixel.x)/pixel.xStage,2)+Math.pow((targetloc.y-pixel.y)/pixel.yStage,2) <= 1) {
                          inList.push({x: storageList.shield_gen[A].x,y: storageList.shield_gen[A].y});
                        }
                    }
                }
            }
            pixel.nestObj = inList;
            for (let B in outList) {
                var targetloc = pixelMap[outList[B].x][outList[B].y];
                if (!targetloc.xStage || !targetloc.yStage) {continue;}
                if (!targetloc.nestObj) {targetloc.nestObj = [];}
                if (Math.pow((pixel.x-targetloc.x)/targetloc.xStage,2)+Math.pow((pixel.y-targetloc.y)/targetloc.yStage,2) <= 1) {
                    targetloc.nestObj.push({x: pixel.x,y: pixel.y});
                }
            }
        }
        var tempobj = [];
        for (let a in pixel.nestObj) {
            if (isEmpty(pixel.nestObj[a].x,pixel.nestObj[a].y)) {continue;}
            if (pixelMap[pixel.nestObj[a].x][pixel.nestObj[a].y].element !== "shield_gen") {continue;}
            tempobj.push({x: pixel.nestObj[a].x,y: pixel.nestObj[a].y});
        }
        pixel.nestObj = tempobj;
        if (pixel.timer == 10) {pixel.syncCheck = 0;}
        if (pixel.store1 != pixel.x) {pixel.syncCheck = 0; pixel.store1 = pixel.x;}
        if (pixel.store2 != pixel.y) {pixel.syncCheck = 0; pixel.store2 = pixel.y;}
        if (pixel.store3 != pixel.xStage) {pixel.syncCheck = 0; pixel.store3 = pixel.xStage;}
        if (pixel.store4 != pixel.yStage) {pixel.syncCheck = 0; pixel.store4 = pixel.yStage;}
		
        //the part that manages the shield
        var coords = ovalRingCoords(pixel.x,pixel.y,pixel.xStage,pixel.yStage,pixel.gap);
        coords.forEach(function(coord){
            var x = coord.x;
            var y = coord.y;
            if (!outOfBounds(x,y)) {
                var p = pixelMap[x][y];
                if (pixel.syncCheck == 10 && pixel.timer == 0) {
                    if (isEmpty(x,y)) {
                        createPixel("barrier",x,y);
                    } else if ((!isEmpty(x,y)) && pixelMap[x][y].element === "barrier") {
                        if (pixel.timer == 0) {
                            p.emitted = 1;
                            p.emitX = pixel.x;
                            p.emitY = pixel.y;
                            p.timer = 5;
                            if (pixel.link != false) {
                              p.link = pixel.link[0].toString() + "." + pixel.link[1].toString();
                            } else {p.link = false;}
                        }
                    }
                } else if (pixel.syncCheck == 9) {
                    if (!isEmpty(x,y)) {
                        if (pixelMap[x][y].element === "barrier") {
                            if (p.emitted == 1) {
                                var p2 = pixelMap[p.emitX][p.emitY];
                                if (!outOfBounds(p2.x,p2.y) && !isEmpty(p2.x,p2.y)) {
                                    if (p2.element === "shield_gen" && p2.syncCheck == 10) {
                                        var resonate = false;
                                        if (Math.pow((p.x-p2.x)/(p2.xStage+p2.gap),2)+Math.pow((p.x-p2.x)/(p2.xStage+p2.gap),2)) {
                                            resonate = true;
                                        }
                                        if (resonate == true) {
                                            changePixel(pixel,"plasma");
                                        }
                                    }
                                }
                            }
                        } else if (pixelMap[x][y].element === "shield_gen") {
                            changePixel(pixel, "plasma");
                        }
                    }
                }
            }
        })
        if (pixel.syncCheck < 10 && pixel.syncCheck >= 0) {
            pixel.syncCheck++;
        } else if (pixel.syncCheck > 10) {
            pixel.syncCheck = 10;
        }
        if (pixel.timer > 0) {
            pixel.timer--;
        }
    },
    category: "machines",
    state: "solid",
    desc: "Creates a barrier that stops most explosions. " +
    "The shield can be damaged by explosions, with larger ones hurting more. "+
    "The shield will go offline if too damaged, and regenerates when not being damaged.<br/>",
    maxSize: 1,
    excludeRandom: true,
    insulate: true,
    movable: false,
};

elements.shield_hardener = {
    color: "#50c8c8",
    behavior: behaviors.WALL,
    hardness: 0.75,
    conduct: 1,
    category: "components",
    desc: "Halves damage to shields from smaller explosions, but doubles damage from larger ones. " +
    "The more hardeners are connected, the larger the explosions that can be resisted.<br/>",
    insulate: true,
    state: "solid",
    compType: "shields"
};

elements.shield_charger = {
    color: "#50c8c8",
    behavior: behaviors.WALL,
    hardness: 0.75,
    conduct: 1,
    category: "components",
    desc: "Allows shields to regenerate while taking damage, but generates heat. " +
    "Heat is spread across all augmenters in a network, and less is generated the more are connected.<br/>" +
    "Explodes if above 6000 degrees.</br>",
    tempHigh: 6000,
    stateHigh: "explosion",
    state: "solid",
    compType: "shields"
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
                    if (pixelMap[pixel.emitX][pixel.emitY].element !== "shield_gen") {
                        changePixel(pixel,"purplectric");
                    } else if (pixelMap[pixel.emitX][pixel.emitY].timer > 0) {
                        changePixel(pixel,"purplectric");
                    } else {
                        var b = 255*(pixelMap[pixel.emitX][pixel.emitY].health / 100);
                        pixel.color = "rgb(255,0,"+b+")";
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

//Could this be more efficient: absolutely. Will I make this more efficient: absolutely not.
elements.disintegrate = {
    color: ["#6f00ff","#996bd9","#6f00ff"],
    onShiftSelect: function(element) {
      promptInput("How wide of an area do you want to disintegrate?", function(r) {
        if (!r) {return;}
        r = parseInt(r);
        if (isNaN(r)) {return;}
        r = Math.max(1,r);
        currentElementProp = {decay: r};
      }, elemTitleCase(elements[element].name || element));
    },
    tick: function(pixel) {
      if (!pixel.trigger) {
        pixel.trigger = 1;
        if (!pixel.decay) {pixel.decay = 10;}
        if (!pixel.stage) {pixel.stage = ((pixelTicks+1) % 3)+1;}
      }
      if (!(pixel.stage && pixel.stage > 0 && pixel.stage < 4)) {pixel.stage = 1;}
      if (pixelTicks % 3 === pixel.stage-1 && pixel.trigger < 3) {
        if (pixel.decay > 0) {
          for (var i = 0; i < adjacentCoords.length; i++) {
            var coords = adjacentCoords[i];
            var x = pixel.x + coords[0];
            var y = pixel.y + coords[1];
            if (!isEmpty(x,y,true)) {
              var newPixel = pixelMap[x][y];
              var es = newPixel.element;
              if (Math.random() > 0.5+(pixel.decay/10)) {continue;}
              if (es !== "disintegrate" && es !== "barrage_spawner" && es !== "hotter_plasma" && es !== "plasma" && es !== "fire" && es !== "nano_armor" && elements[es].hardness !== 1) {
                var cstore = newPixel.color;
                var hstore = 0;
                if (elements[newPixel.element].hardness) {hstore = Math.round((elements[newPixel.element].hardness)*20);}
                changePixel(newPixel,"disintegrate");
                newPixel.trigger = 2;
                newPixel.baseColor = newPixel.color;
                newPixel.color = cstore;
                newPixel.timerMax = 10+hstore;
                newPixel.decay = pixel.decay-1;
                switch (pixel.stage) {
                  case 1: newPixel.stage = 2; break; //green
                  case 2: newPixel.stage = 3; break; //red
                  case 3: newPixel.stage = 1; break; //blue
                }
              }
            } 
          }
        }
        if (pixel.trigger == 2 && pixel.baseColor && pixel.timerMax) {
          pixel.trigger = 3;
          pixel.oldColor = pixel.color;
          pixel.timer = pixel.timerMax;
        } else if (pixelTicks-pixel.start>=3) {
          changePixel(pixel, "hotter_plasma");
        }
      }
      if (pixel.trigger == 3) {
        if (pixel.timer > 0) {
          var s1 = pixel.timer/pixel.timerMax;
          var s2 = 1-s1;
          var oL = [pixel.oldColor.indexOf(","),pixel.oldColor.lastIndexOf(","),pixel.oldColor.indexOf(")")];
          var bL = [pixel.baseColor.indexOf(","),pixel.baseColor.lastIndexOf(","),pixel.baseColor.indexOf(")")];
          var oV = [pixel.oldColor.slice(4,oL[0]),pixel.oldColor.slice(oL[0]+1,oL[1]),pixel.oldColor.slice(oL[1]+1,oL[2])];
          var bV = [pixel.baseColor.slice(4,bL[0]),pixel.baseColor.slice(bL[0]+1,bL[1]),pixel.baseColor.slice(bL[1]+1,bL[2])];
          var fC = [((s1*oV[0])+(s2*bV[0])),((s1*oV[1])+(s2*bV[1])),((s1*oV[2])+(s2*bV[2])),];
          /*fC[0] = Math.round(fC[0]);
          fC[1] = Math.round(fC[1]);
          fC[2] = Math.round(fC[2]);*/
          pixel.color = "rgb("+fC[0]+","+fC[1]+","+fC[2]+")";
          pixel.timer--;
        } else {
          changePixel(pixel, "hotter_plasma");
        }
      }
      if (pixelTicks-pixel.start >= 30) {changePixel(pixel, "hotter_plasma");}
      doDefaults(pixel);
    },
    temp:15000,
    category: "energy",
    state: "solid",
    density: 1,
    movable: false,
    insulate: true,
    //charge: 0.5,
    conduct: 1
};

elements.shattertech_info = {
  color: ["#6f00ff","#996bd9","#6f00ff"],
  behavior: behaviors.WALL,
  onSelect: function() {
    showInfo("shattertech_info");
  },
  tool: function() {
    showInfo("shattertech_info");
  },
  onMouseDown: function() {
    showInfo("shattertech_info");
  },
  category: "tools",
  canPlace: false,
  desc: "if you're having trouble figuring out an element, read it's description<br/>currently WIP"
};

let shieldConfigVal = [15,15]; //setting to 15,15 in case it doesn't get set below

elements.shield_config = {
  color: ["#00c8c8","#00afaf"],
  onSelect: function(){
    promptInput("Enter desired shield width (1-40)\ndecimals will be rounded", (answer1) => {
        if (!answer1) {selectElement("unknown"); return}
        else if (isNaN(answer1)) {selectElement("unknown"); logMessage("Not a number!"); return}
        else if (answer1 < 1 || answer1 > 40) {selectElement("unknown"); logMessage("Width must be between 1 and 40!"); return}
        promptInput("Enter desired shield height (1-40)\ndecimals will be rounded", (answer2) => {
            if (!answer2) {selectElement("unknown"); return}
            else if (isNaN(answer2)) {selectElement("unknown"); logMessage("Not a number!"); return}
            else if (answer2 < 1 || answer2 > 40) {selectElement("unknown"); logMessage("Height must be between 1 and 40!"); return}
            var widthStore = Math.round(parseFloat(answer1));
            var heightStore = Math.round(parseFloat(answer2));
            shieldConfigVal = [widthStore,heightStore];
            logMessage("width: " + widthStore + ", height: " + heightStore);
          }, "Enter height")
      }, "Enter width")
  },
  tool: function(pixel) {
    if (pixel.element === "shield_gen") {
      pixel.xStage = shieldConfigVal[0];
      pixel.yStage = shieldConfigVal[1];
    }
    return;
  },
  category: "special",
  maxSize: 1
};

elements.wire.ignoreConduct = ["net_link"];
elements.explosion.tick = function(pixel){
    explodeAt(pixel.x, pixel.y, pixel.radius || 10, "fire");
    deletePixel(pixel.x, pixel.y);
};

function c_u_handler(type,counts,x,y) {
    var p = pixelMap[x][y];
    if (type === "emitters") {
        var stores = [false,0];
        if (counts.beam_overclocker) {
            stores[0] = true;
            var heating = Math.ceil(100 / counts.beam_overclocker);
            if (isNaN(heating)) {heating = 0;}
            else if (heating < 0) {heating = 0;}
            stores[1] = heating;
        }
        p.overclocked = stores[0];
        p.heatup = stores[1];
    } else if (type === "shields") {
        if (counts.shield_hardener) {
            p.threshold = 2.5 * counts.shield_hardener;
        } else {p.threshold = 0;}
        if (counts.shield_charger) {
            p.boosted = true;
        } else {p.boosted = false;}
    }
    return;
};

function listCompare(list1,list2) {
    if (list1.length != list2.length) {return false;}
    var check = false;
    for (var i = 0; i < list1.length; i++) {
        if (list1[i] !== list2[i]) {
            check = true;
            break;
        }
    }
    return check;
};

function barrage(x,y,r1,r2,fire1="fire",fire2="fire"){
    explodeAt(x,y,r1,fire1);
    if (!storageList.barrages) {storageList.barrages = {};}
    var templength = 0;
    for (let z in storageList.barrages) {
        templength++;
    }
    if (templength < 1) {
      var tempCoords = circleCoords(x,y,r1);
      var checks = shieldcheck(x,y,r1,false);
      var coords = [];
      if (r1 < 31 && checks !== false) {
        var bypass = false;
        for (i = 0; i < tempCoords.length; i++) {
          bypass = false;
          if (checks.sCVal == true) {
            for (let z in checks.sCC) {
              if (tempCoords[i].x == checks.sCC[z].x && tempCoords[i].y == checks.sCC[z].y) {
                bypass = true;
              } else if (!checks.sCC[z].f) {
                var tSCC = checks.sCC[z];
                if (Math.pow((tempCoords[i].x-tSCC.x)/tSCC.xs,2)+Math.pow((tempCoords[i].y-tSCC.y)/tSCC.ys,2) > 1) {bypass = true;}
              }
            }
          }
          if (checks.sFVal == true) {
            for (let z in checks.sFC) {
              var tSFC = checks.sFC[z];
              if (Math.pow((tempCoords[i].x-tSFC.x)/tSFC.xs,2)+Math.pow((tempCoords[i].y-tSFC.y)/tSFC.ys,2) <= 1) {bypass = true;}
            }
          }
          if (bypass == false) {coords.push(tempCoords[i]);}
        }
      } else {coords = tempCoords;}
      if (coords.length > 0) {
        var tempVal = {x: x,y: y,r1: r1,r2: r2,fire: fire2,locList: coords,time: 31};
        if (isObjValDupe(storageList.barrages,tempVal) == false) {
          storageList.barrages[templength] = tempVal;
        }
      }
    }
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

function shieldcheck(x,y,radius,doDamage) {
  if (storageList.shield_gen) {
    //stage 1 - seperates shields by if explosion is outside shield area
    var sc1 = {c: [0,0,0,0],f: [],confirm: [false,false]};
    var sc2 = {c: [],f: []};
    var sc3 = {c: [],f: []};
    var shieldCloseCheck = false;
    var shieldFarCheck = false;
    var nestList = {t: {},f: {}};
    for (let a in storageList.shield_gen) {
      var x1 = storageList.shield_gen[a].x;
      var y1 = storageList.shield_gen[a].y;
      var p = pixelMap[x1][y1];
      if (isEmpty(x1,y1)) {
        continue;
      } else if ((p.element !== "shield_gen") || !(p.xStage && p.yStage)) {
        continue;
      }
      if (Math.abs(x-x1) > p.xStage+p.gap.radius) {continue;}
      if (Math.abs(y-y1) > p.yStage+p.gap+radius) {continue;}
      if(Math.pow((x-x1)/p.xStage,2)+Math.pow((y-y1)/p.yStage,2) <= 1) {
      //if (findFociDistance(x,fLI[0],fLI[2],y,fLI[1],fLI[3]) <= fLI[4]) {
        if (p.health > 0 && p.timer == 0 && p.syncCheck == 10) {
          if (radius <= 30) {
            if (sc1.confirm[0] !== false) {
              if (p.xStage < sc1.c[2] && p.yStage < sc1.c[3]) {
                sc3.c.push({x: sc1.c[0],y: sc1.c[1],f: true});
                sc1.c = [x1,y1,p.xStage,p.yStage];
              }
            } else {
              sc1.c = [x1,y1,p.xStage,p.yStage];
              sc1.confirm[0] = true;
            }
          } else {
            sc2.c.push({x: x1,y: y1});
          }
        }
      } else {
        if (radius <= 30) {
          sc1.f.push({x: x1,y: y1});
          if (p.nestObj) {
            for (let b in p.nestObj) {
              if (!nestList.f[p.nestObj[b].x]) {nestList.f[p.nestObj[b].x] = {};}
              nestList.f[p.nestObj[b].x][p.nestObj[b].y] = true;
            }
          }
        } else {
          sc2.f.push({x: x1,y: y1});
        }
      }
    }
    //stage 2 - assembles nest list for closest shield, checks for valid far shields
    if (radius <= 30) {
      if (sc1.confirm[0] !== false) {
        sc2.c.push({x: sc1.c[0],y: sc1.c[1]});
        shieldCloseCheck = true;
        var p = pixelMap[sc1.c[0]][sc1.c[1]];
        if (p.nestObj) {
          var tempVal = 0;
          for (let a in p.nestObj) {
            if (!nestList.t[p.nestObj[a].x]) {nestList.t[p.nestObj[a].x] = {};}
            nestList.t[p.nestObj[a].x][p.nestObj[a].y] = true;
            tempVal++;
          }
          if (tempVal > 0) {sc1.confirm[1] = true;}
        }
      }
      for (let a in sc1.f) {
        var x1 = sc1.f[a].x;
        var y1 = sc1.f[a].y;
        var p = pixelMap[x1][y1];
        if (p.health > 0 && p.timer == 0 && p.syncCheck == 10) {
          var nLCheck = [false,false];
          if (!nestList.f[x1]) {nLCheck[0] = true;} else if (!nestList.f[x1][y1]) {nLCheck[0] = true;}
          if (nestList.t[x1]) {if (nestList.t[x1][y1]) {nLCheck[1] = true;}}
          if ((nLCheck[1] === true || sc1.confirm[1] === false) && nLCheck[0] === true) {
            sc2.f.push({x: x1,y: y1});
          }
        }
      }
    }
    //stage 3 - processes assembled lists
    //"your scientists were so procupied with whether or not they could that they didn't stop to think if they should"
    for (let a in sc2) {
      for (let b in sc2[a]) {
        var p = pixelMap[sc2[a][b].x][sc2[a][b].y];
        var inrange = [false,false];
        if (Math.pow((x-p.x)/(p.xStage+radius),2)+Math.pow((y-p.y)/(p.yStage+radius),2) <= 1) {
          inrange[0] = true;
          if (radius >= p.xStage || radius >= p.yStage) {inrange[1] = true;}
          else if (Math.pow((x-p.x)/(p.xStage-radius),2)+Math.pow((y-p.y)/(p.yStage-radius),2) >= 1) {inrange[1] = true;}
        }
        if (inrange[0] == true) {
          if (inrange[1] == true) {
            sc3[a].push({x: p.x,y: p.y,xs: p.xStage,ys: p.yStage});
            if (a === "f") {shieldFarCheck = true;}
            if (doDamage === true) {
              var sDamage = Math.pow(10,((radius/10)-1));
              if (p.threshold > 0) {
                if (sDamage <= p.threshold) {sDamage *= 0.5;}
                else {sDamage *= 2;}
              }
              if (p.health > 0) {
                p.health -= sDamage;
              }
              if (sDamage > 0) {p.heat = 60;}
            }
          } else if (a === "c") {sc3.c.push({x: sc2[a][b].x,y: sc2[a][b].y,f: true});}
        }
      }
    }
    var tempobj = {sCC: sc3.c,sCVal: shieldCloseCheck,sFC: sc3.f,sFVal: shieldFarCheck};
    return tempobj;
  } else {return false;}
};

explodeAt = function(x,y,radius,fire="fire") {
    // if fire contains , split it into an array
    if (fire.indexOf(",") !== -1) {
        fire = fire.split(",");
    }
    var coords = circleCoords(x,y,radius);
    var power = radius/10;
    var checks = shieldcheck(x,y,radius,true);
    var bypass = false;
    //for (var p = 0; p < Math.round(radius/10+1); p++) {
    for (var i = 0; i < coords.length; i++) {
        bypass = false;
        if (radius <= 30 && bypass == false && checks !== false) {
            if (checks.sCVal == true) {
                for (let z in checks.sCC) {
                    if (coords[i].x == checks.sCC[z].x && coords[i].y == checks.sCC[z].y) {
                        bypass = true;
                    } else if (!checks.sCC[z].f) {
                        var tSCC = checks.sCC[z];
                        if (Math.pow((coords[i].x-tSCC.x)/tSCC.xs,2)+Math.pow((coords[i].y-tSCC.y)/tSCC.ys,2) > 1){
                            bypass = true;
                        }
                    }
                }
            }
            if (checks.sFVal == true) {
                for (let z in checks.sFC){
                    var tSFC = checks.sFC[z];
                    if (Math.pow((coords[i].x-tSFC.x)/tSFC.xs,2)+Math.pow((coords[i].y-tSFC.y)/tSFC.ys,2) <= 1){
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

runEveryTick(function () {
    if (storageList && !storageList.tickcheck) {storageList.tickcheck = pixelTicks;}
    if (storageList.shield_gen) {
      var placehold = [];
      var exclude = false;
      for (let z in storageList.shield_gen) {
        exclude = false;
        var ts = storageList.shield_gen[z];
        for (let h in ts) {if (h != "x" && h != "y" && h != "onBorder") {exclude = true;}}
        if (ts.onBorder) {logMessage("failsafe triggered")};
        var x1;
        var y1;
        if (!ts.onBorder && ((!ts.x) || (!ts.y))) {
          exclude = true;
        } else {
          x1 = ts.x;
          y1 = ts.y;
          if (isEmpty(x1,y1)) {exclude = true;}
          else if (pixelMap[x1][y1].element !== "shield_gen") {exclude = true;}
        }
        if (exclude == false) {
          placehold.push({x: ts.x,y: ts.y});
        }
      }
      storageList.shield_gen = {};
      for (let z in placehold) {
        storageList.shield_gen[z] = placehold[z];
      }
    }
    if (storageList.barrages) {
      if (storageList.tickcheck != pixelTicks) {storageList.tickcheck = pixelTicks;} else {return;}
        var placehold = [];
        for (let z in storageList.barrages){
          if (storageList.barrages[z].time < 31) {
            var coords = storageList.barrages[z].locList;
            var hitlocs = [];
            for (i=0; i<3; i++){
              while (hitlocs.length != i+1) {
                var tempstor = Math.floor(Math.random() * coords.length);
                var addbool = true;
                for (let p in hitlocs) {
                  if (tempstor == hitlocs[p]) {addbool = false;}
                }
                if (addbool == true) {hitlocs.push(tempstor);}
              }
            }
            for (let q in hitlocs) {
              var x = coords[hitlocs[q]].x;
              var y = coords[hitlocs[q]].y;
              var r = storageList.barrages[z].r2;
              var f = storageList.barrages[z].fire;
              if (!outOfBounds(x,y)) {
                explodeAt(x,y,r,f);
              }
            }
          }
          if (storageList.barrages[z].time > 0 ) {storageList.barrages[z].time--;}
          if (storageList.barrages[z].time && storageList.barrages[z].time > 0) {placehold.push(storageList.barrages[z]);}
        }
        storageList.barrages = {};
        for (let z in placehold) {
          storageList.barrages[z] = placehold[z];
        }
    }
    return;
});

runAfterReset(function() {
    storageList = {};
});

runAfterLoad(function() {
    storageList = {};
});
