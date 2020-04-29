//shortcuts in the code to test bugs
var _d={
    ws:ui.wheelStuff,
    p:()=>_d.ws.wheel.wheel.wheelGroup.percent,
    pc:()=>_d.ws.wheel.wheel.wheelGroup.getCurrentPiece(),
    hi:function(n){
        _d.ws.wheel.currAnimation = winnerPiece(_d.ws.wheel,n);
        _d.ws.wheel.currAnimation.next();
    }
}
