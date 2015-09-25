'use strict';

crop.factory('cropAreaFixedRectangle', ['cropArea', function(CropArea) {
  var CropAreaFixedRectangle = function() {
    CropArea.apply(this, arguments);

    this._resizeCtrlBaseRadius = 30;
    this._resizeCtrlNormalRatio = 0.75;
    this._resizeCtrlHoverRatio = 1;
    this._iconMoveNormalRatio = 0.9;
    this._iconMoveHoverRatio = 1.2;

    this._resizeCtrlNormalRadius = this._resizeCtrlBaseRadius*this._resizeCtrlNormalRatio;
    this._resizeCtrlHoverRadius = this._resizeCtrlBaseRadius*this._resizeCtrlHoverRatio;

    this._posDragStartX=0;
    this._posDragStartY=0;
    this._posResizeStartX=0;
    this._posResizeStartY=0;
    this._posResizeStartSize={w: 0, h: 0};

    this._resizeCtrlIsHover = -1;
    this._areaIsHover = false;
    this._resizeCtrlIsDragging = -1;
    this._areaIsDragging = false;
  };

  CropAreaFixedRectangle.prototype = new CropArea();

  /* override CropArea */
  CropAreaFixedRectangle.prototype._preventBoundaryCollision=function(size) {
    var canvasH=this._ctx.canvas.height,
        canvasW=this._ctx.canvas.width;

    var nw = {x: size.x, y: size.y};
    var se = this._southEastBound(size);

    // check northwest corner
    if(nw.x<0) { nw.x=0; se.x = size.w }
    if(nw.y<0) { nw.y=0; se.y = size.h }

    // check southeast corner
    if(se.x>canvasW) { se.x = canvasW; nw.x = canvasW - size.w }
    if(se.y>canvasH) { se.y = canvasH; nw.y = canvasH - size.h }

    var newSize = {x: nw.x,
      y: nw.y,
      w: se.x - nw.x,
      h: se.y - nw.y};

    //check size (if < min, adjust nw corner)
    if (newSize.w < this._minSize.w) {
      newSize.w = this._minSize.w;
      se = this._southEastBound(newSize);
      //adjust se corner, if it's out of bounds
      if(se.x>canvasW)
      {
        se.x = canvasW;
        //adjust nw corner according to min width
        nw.x = Math.max(se.x - canvasW, se.x - this._minSize.w);
        newSize = {x: nw.x,
          y: nw.y,
          w: se.x - nw.x,
          h: se.y - nw.y};
      }
    }

    if (newSize.h < this._minSize.h) {
      newSize.h = this._minSize.h;
      se = this._southEastBound(newSize);

      if(se.y>canvasH)
      {
        se.y = canvasH;
        //adjust nw corner according to min height
        nw.y = Math.max(se.y - canvasH, se.y - this._minSize.h);
        newSize = {x: nw.x,
          y: nw.y,
          w: se.x - nw.x,
          h: se.y - nw.y};
      }
    }

    //finally, enforce 1:1 aspect ratio for sqaure-like selections
    if (this.getType() === "circle" || this.getType() === "square")
    {
      newSize = {x: newSize.x,
        y: newSize.y,
        w: newSize.w,
        h: newSize.h};
    }
    return newSize;
  };

  // return a type string
  CropAreaFixedRectangle.prototype.getType = function() {
    return 'fixed-rectangle';
  }

  CropAreaFixedRectangle.prototype._calcRectangleCorners=function() {
    var size = this.getSize();
    var se = this.getSouthEastBound();
    return [
      [size.x, size.y], //northwest
      [se.x, size.y], //northeast
      [size.x, se.y], //southwest
      [se.x, se.y] //southeast
    ];
  };

  CropAreaFixedRectangle.prototype._calcRectangleDimensions=function() {
    var size = this.getSize();
    var se = this.getSouthEastBound();
    return {
      left: size.x,
      top: size.y,
      right: se.x,
      bottom: se.y
    };
  };

  CropAreaFixedRectangle.prototype._isCoordWithinArea=function(coord) {
    var rectangleDimensions=this._calcRectangleDimensions();
    return (coord[0]>=rectangleDimensions.left&&coord[0]<=rectangleDimensions.right&&coord[1]>=rectangleDimensions.top&&coord[1]<=rectangleDimensions.bottom);
  };

  CropAreaFixedRectangle.prototype._isCoordWithinResizeCtrl=function(coord) {
    var resizeIconsCenterCoords=this._calcRectangleCorners();
    var res=-1;
    for(var i=0,len=resizeIconsCenterCoords.length;i<len;i++) {
      var resizeIconCenterCoords=resizeIconsCenterCoords[i];
      if(coord[0] > resizeIconCenterCoords[0] - this._resizeCtrlHoverRadius && coord[0] < resizeIconCenterCoords[0] + this._resizeCtrlHoverRadius &&
        coord[1] > resizeIconCenterCoords[1] - this._resizeCtrlHoverRadius && coord[1] < resizeIconCenterCoords[1] + this._resizeCtrlHoverRadius) {
        res=i;
        break;
      }
    }
    return res;
  };

  CropAreaFixedRectangle.prototype._drawArea=function(ctx,center,size){
    ctx.rect(size.x,size.y,size.w,size.h);
  };

  CropAreaFixedRectangle.prototype.draw=function() {
    // draw ruler
    var s = this.getSize();
    var w = (s.w / this.getMinSize().w) * this.getMinRuler();
    this._cropCanvas.drawHRuler(s.x, s.y, s.x + s.w, s.y, w);
    this._cropCanvas.drawVRuler(s.x, s.y, s.x, s.y + s.h, w);

    this._cropCanvas.drawCropArea(this._image,this.getCenterPoint(),this._size,this._drawArea, 0);

    var center=this.getCenterPoint();
    // draw move icon
    this._cropCanvas.drawIconMove([center.x, center.y], this._areaIsHover?this._iconMoveHoverRatio:this._iconMoveNormalRatio);

    // draw resize thumbs
    var resizeIconsCenterCoords=this._calcRectangleCorners();
    for(var i=0,len=resizeIconsCenterCoords.length;i<len;i++) {
      var resizeIconCenterCoords=resizeIconsCenterCoords[i];
      this._cropCanvas.drawIconResizeMark(resizeIconCenterCoords, i, this._resizeCtrlBaseRadius, this._resizeCtrlIsHover===i?this._resizeCtrlHoverRatio:this._resizeCtrlNormalRatio);
    }
  };

  function dist(p1x, p1y, p2x, p2y){
    return Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2))
  }

  CropAreaFixedRectangle.prototype.processMouseMove=function(mouseCurX, mouseCurY) {
    var cursor='default';
    var res=false;

    this._resizeCtrlIsHover = -1;
    this._areaIsHover = false;

    if (this._areaIsDragging) {
      this.setCenterPoint({x: mouseCurX - this._posDragStartX,
        y: mouseCurY - this._posDragStartY});
      this._areaIsHover = true;
      cursor='move';
      res=true;
      this._events.trigger('area-move');
    } else if (this._resizeCtrlIsDragging>-1) {
      var s = this.getSize();
      var se = this.getSouthEastBound();
      var oldDia = dist(s.x, s.y, se.x, se.y);
      var newDia, scale;
      switch(this._resizeCtrlIsDragging) {
        case 0: // Top Left
          newDia = dist(mouseCurX, mouseCurY, se.x, se.y);
          scale = newDia / oldDia;
          this.setSizeByCorners({x: se.x - (s.w*scale), y: se.y - (s.h*scale)}, {x: se.x, y: se.y});
          cursor = 'nwse-resize';
          break;
        case 1: // Top Right
          newDia = dist(s.x, s.y+s.h, mouseCurX, mouseCurY);
          scale = newDia / oldDia;
          this.setSizeByCorners({x: s.x, y: se.y - (s.h*scale)}, {x: s.x + (s.w*scale), y: se.y});
          cursor = 'nesw-resize';
          break;
        case 2: // Bottom Left
          newDia = dist(s.x + s.w, s.y, mouseCurX, mouseCurY);
          scale = newDia / oldDia;
          this.setSizeByCorners({x: se.x - (s.w*scale), y: s.y}, {x: se.x, y: s.y + (s.h*scale)});
          cursor = 'nesw-resize';
          break;
        case 3: // Bottom Right
          newDia = dist(s.x, s.y, mouseCurX, mouseCurY);
          scale = newDia / oldDia;
          this.setSizeByCorners({x: s.x, y: s.y}, {x: s.x + (s.w*scale), y: s.y + (s.h*scale)});
          cursor = 'nwse-resize';
          break;
      }

      this._resizeCtrlIsHover = this._resizeCtrlIsDragging;
      res=true;
      this._events.trigger('area-resize');
    } else {
      var hoveredResizeBox=this._isCoordWithinResizeCtrl([mouseCurX,mouseCurY]);
      if (hoveredResizeBox>-1) {
        switch(hoveredResizeBox) {
          case 0:
            cursor = 'nwse-resize';
            break;
          case 1:
            cursor = 'nesw-resize';
            break;
          case 2:
            cursor = 'nesw-resize';
            break;
          case 3:
            cursor = 'nwse-resize';
            break;
        }
        this._areaIsHover = false;
        this._resizeCtrlIsHover = hoveredResizeBox;
        res=true;
      } else if(this._isCoordWithinArea([mouseCurX,mouseCurY])) {
        cursor = 'move';
        this._areaIsHover = true;
        res=true;
      }
    }

    angular.element(this._ctx.canvas).css({'cursor': cursor});

    return res;
  };

  CropAreaFixedRectangle.prototype.processMouseDown=function(mouseDownX, mouseDownY) {
    var isWithinResizeCtrl=this._isCoordWithinResizeCtrl([mouseDownX,mouseDownY]);
    if (isWithinResizeCtrl>-1) {
      this._areaIsDragging = false;
      this._areaIsHover = false;
      this._resizeCtrlIsDragging = isWithinResizeCtrl;
      this._resizeCtrlIsHover = isWithinResizeCtrl;
      this._posResizeStartX=mouseDownX;
      this._posResizeStartY=mouseDownY;
      this._posResizeStartSize = this._size;
      this._events.trigger('area-resize-start');
    } else {
      this._areaIsDragging = true;
      this._areaIsHover = true;
      this._resizeCtrlIsDragging = -1;
      this._resizeCtrlIsHover = -1;
      var center = this.getCenterPoint();
      this._posDragStartX = mouseDownX - center.x;
      this._posDragStartY = mouseDownY - center.y;
      this._events.trigger('area-move-start');
    }
  };

  CropAreaFixedRectangle.prototype.processMouseUp=function(/*mouseUpX, mouseUpY*/) {
    if(this._areaIsDragging) {
      this._areaIsDragging = false;
      this._events.trigger('area-move-end');
    }
    if(this._resizeCtrlIsDragging>-1) {
      this._resizeCtrlIsDragging = -1;
      this._events.trigger('area-resize-end');
    }
    this._areaIsHover = false;
    this._resizeCtrlIsHover = -1;

    this._posDragStartX = 0;
    this._posDragStartY = 0;
  };

  return CropAreaFixedRectangle;
}]);
