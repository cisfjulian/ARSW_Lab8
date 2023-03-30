var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var topic = "/topic/newpoint.";

    var addPointToTopic = function(point){
            stompClient.send(topic, {}, JSON.stringify(point));
        };

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe(topic, function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                var pt=new Point(theObject.x,theObject.y);
                addPointToCanvas(pt);
            });
        });
    };
    
    

    return {

        connect: function (nodibujo) {
            var can = document.getElementById("canvas");

            topic = topic + nodibujo;

            //websocket connection
            connectAndSubscribe();
            if(window.PointerEvent){
             can.addEventListener("pointerdown",function(evt){
                 var pt = getMousePosition(evt);
                 addPointToCanvas(pt);
                 addPointToTopic(pt);
             })
            }
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
            addPointToTopic(pt);         },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();