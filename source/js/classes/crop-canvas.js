'use strict';

crop.factory('cropCanvas', [function() {
  // Shape = Array of [x,y]; [0, 0] - center
  var shapeArrowNW=[[-0.5,-2],[-3,-4.5],[-0.5,-7],[-7,-7],[-7,-0.5],[-4.5,-3],[-2,-0.5]];
  var shapeArrowNE=[[0.5,-2],[3,-4.5],[0.5,-7],[7,-7],[7,-0.5],[4.5,-3],[2,-0.5]];
  var shapeArrowSW=[[-0.5,2],[-3,4.5],[-0.5,7],[-7,7],[-7,0.5],[-4.5,3],[-2,0.5]];
  var shapeArrowSE=[[0.5,2],[3,4.5],[0.5,7],[7,7],[7,0.5],[4.5,3],[2,0.5]];
  var shapeArrowN=[[-1.5,-2.5],[-1.5,-6],[-5,-6],[0,-11],[5,-6],[1.5,-6],[1.5,-2.5]];
  var shapeArrowW=[[-2.5,-1.5],[-6,-1.5],[-6,-5],[-11,0],[-6,5],[-6,1.5],[-2.5,1.5]];
  var shapeArrowS=[[-1.5,2.5],[-1.5,6],[-5,6],[0,11],[5,6],[1.5,6],[1.5,2.5]];
  var shapeArrowE=[[2.5,-1.5],[6,-1.5],[6,-5],[11,0],[6,5],[6,1.5],[2.5,1.5]];

  // Colors
  var colors={
    areaOutline: '#fff',
    resizeBoxStroke: '#fff',
    resizeBoxFill: '#444',
    resizeBoxArrowFill: '#fff',
    resizeCircleStroke: '#fff',
    resizeCircleFill: '#444',
    moveIconFill: '#fff'
  };

  return function(ctx){

    /* Base functions */

    // Calculate Point
    var calcPoint=function(point,offset,scale) {
        return [scale*point[0]+offset[0], scale*point[1]+offset[1]];
    };

    // Draw Filled Polygon
    var drawFilledPolygon=function(shape,fillStyle,centerCoords,scale) {
        ctx.save();
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        var pc, pc0=calcPoint(shape[0],centerCoords,scale);
        ctx.moveTo(pc0[0],pc0[1]);

        for(var p in shape) {
            if (p > 0) {
                pc=calcPoint(shape[p],centerCoords,scale);
                ctx.lineTo(pc[0],pc[1]);
            }
        }

        ctx.lineTo(pc0[0],pc0[1]);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    };

    this.drawHRuler= function(p1x, p1y, p2x, p2y, cmLength){
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = 1;
      var mmLength = cmLength*0.1;
      var x = p1x;
      for(;x<=p2x+0.09; x+=mmLength){
        ctx.moveTo(x, p1y);
        ctx.lineTo(x, p1y-7);
      }
      ctx.stroke();
      ctx.closePath();
      ctx.restore();

      // ctx.save();
      // ctx.beginPath();
      // ctx.strokeStyle = '#eee';
      // ctx.lineWidth = 2;
      // var x = p1x;
      // for(;x<=p2x+0.09; x+=5*mmLength){
      //   ctx.moveTo(x, p1y);
      //   ctx.lineTo(x, p1y-15);
      // }
      // ctx.stroke();
      // ctx.closePath();
      // ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'white';
      ctx.font = "10px";
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.lineWidth = 2;
      var x = p1x;
      for(;x<=p2x+0.1; x+=cmLength){
        ctx.moveTo(x, p1y);
        ctx.lineTo(x, p1y-15);
        ctx.fillText(Math.round((x-p1x) / cmLength), x, p1y - 20);
      }
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }

    this.drawVRuler= function(p1x, p1y, p2x, p2y, cmLength){
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = 1;
      var mmLength = cmLength*0.1;
      var y = p1y;
      for(;y<=p2y+0.09; y+=mmLength){
        ctx.moveTo(p1x, y);
        ctx.lineTo(p1x-7, y);
      }
      ctx.stroke();
      ctx.closePath();
      ctx.restore();

      // ctx.save();
      // ctx.beginPath();
      // ctx.strokeStyle = '#eee';
      // ctx.lineWidth = 2;
      // var x = p1x;
      // for(;x<=p2x+0.09; x+=5*mmLength){
      //   ctx.moveTo(x, p1y);
      //   ctx.lineTo(x, p1y-15);
      // }
      // ctx.stroke();
      // ctx.closePath();
      // ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'white';
      ctx.font = "10px";
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.lineWidth = 2;
      var y = p1y;
      for(;y<=p2y+0.1; y+=cmLength){
        ctx.moveTo(p1x, y);
        ctx.lineTo(p1x-15, y);
        ctx.fillText(Math.round((y-p1y) / cmLength), p1x-20, y);
      }
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }

    /* Icons */

    this.drawIconMove=function(centerCoords, scale) {
      drawFilledPolygon(shapeArrowN, colors.moveIconFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowW, colors.moveIconFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowS, colors.moveIconFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowE, colors.moveIconFill, centerCoords, scale);
    };

    /** orientationMap = ['northwest', 'northeast', 'southwest', 'southeast']*/
    this.drawIconResizeMark=function(centerCoords, orientation, radius, scale) {
      var scaledRadius=radius*scale;
      ctx.save();
      ctx.strokeStyle = colors.resizeCircleStroke;
      ctx.lineWidth = 2;
      ctx.fillStyle = colors.resizeCircleFill;
      ctx.beginPath();
      ctx.moveTo(centerCoords[0] + (orientation%2==0? 1:-1)*scaledRadius, centerCoords[1]);
      ctx.lineTo(centerCoords[0], centerCoords[1]);
      ctx.lineTo(centerCoords[0], centerCoords[1] + (orientation<2? 1:-1)*scaledRadius);

      // ctx.fill();
      ctx.lineWidth = 5*scale;
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }

    this.drawIconResizeCircle=function(centerCoords, circleRadius, scale) {
      var scaledCircleRadius=circleRadius*scale;
      ctx.save();
      ctx.strokeStyle = colors.resizeCircleStroke;
      ctx.lineWidth = 2;
      ctx.fillStyle = colors.resizeCircleFill;
      ctx.beginPath();
      ctx.arc(centerCoords[0],centerCoords[1],scaledCircleRadius,0,2*Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    };

    this.drawIconResizeBoxBase=function(centerCoords, boxSize, scale) {
      var scaledBoxSize=boxSize*scale;
      ctx.save();
      ctx.strokeStyle = colors.resizeBoxStroke;
      ctx.lineWidth = 2;
      ctx.fillStyle = colors.resizeBoxFill;
      ctx.fillRect(centerCoords[0] - scaledBoxSize/2, centerCoords[1] - scaledBoxSize/2, scaledBoxSize, scaledBoxSize);
      ctx.strokeRect(centerCoords[0] - scaledBoxSize/2, centerCoords[1] - scaledBoxSize/2, scaledBoxSize, scaledBoxSize);
      ctx.restore();
    };
    this.drawIconResizeBoxNESW=function(centerCoords, boxSize, scale) {
      this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
      drawFilledPolygon(shapeArrowNE, colors.resizeBoxArrowFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowSW, colors.resizeBoxArrowFill, centerCoords, scale);
    };
    this.drawIconResizeBoxNWSE=function(centerCoords, boxSize, scale) {
      this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
      drawFilledPolygon(shapeArrowNW, colors.resizeBoxArrowFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowSE, colors.resizeBoxArrowFill, centerCoords, scale);
    };

    /* Crop Area */

    this.drawCropArea=function(image, centerCoords, size, fnDrawClipPath, lineWidth) {
      var xRatio=image.width/ctx.canvas.width,
          yRatio=image.height/ctx.canvas.height,
          xLeft=size.x,
          yTop=size.y;

      ctx.save();
      ctx.lineWidth = (lineWidth===undefined)? 2 : lineWidth;
      if(lineWidth !== 0){
        ctx.strokeStyle = colors.areaOutline;
        ctx.beginPath();
        fnDrawClipPath(ctx, centerCoords, size);
        ctx.stroke();
        ctx.clip();
      }

      // draw part of original image
      if (size.w > 0 && size.h > 0) {
          ctx.drawImage(image, xLeft*xRatio, yTop*yRatio, size.w*xRatio, size.h*yRatio, xLeft, yTop, size.w, size.h);
      }

      ctx.beginPath();
      fnDrawClipPath(ctx, centerCoords, size);
      ctx.stroke();
      ctx.clip();

      ctx.restore();
    };

  };
}]);