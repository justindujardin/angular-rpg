///<reference path="typings/angular2/angular2.d.ts"/>
if (typeof __decorate !== "function") __decorate = function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
if (typeof __metadata !== "function") __metadata = function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var angular2_1 = require('angular2/angular2');
var RPGMapCanvas = (function () {
    function RPGMapCanvas() {
        this.styleHeight = 256;
        this.styleWidth = 256;
        this.styleBackground = 'rgba(0,0,0,1)';
    }
    RPGMapCanvas = __decorate([
        angular2_1.Component({
            selector: 'rpg-map-canvas'
        }),
        angular2_1.View({
            template: "\n  <canvas [width]=\"styleWidth\" [height]=\"styleHeight\">\n    Your browser doesn't support this.\n  </canvas>\n  ",
            host: {
                '[style.height]': 'styleHeight',
                '[style.width]': 'styleWidth',
                '[style.color]': 'styleBackground'
            }
        }), 
        __metadata('design:paramtypes', [])
    ], RPGMapCanvas);
    return RPGMapCanvas;
})();
angular2_1.bootstrap(RPGMapCanvas);
var RPGAppComponent = (function () {
    function RPGAppComponent() {
        this.name = 'pow2 - rpg!';
        this.things = ['one', 'two', 'three'];
    }
    RPGAppComponent = __decorate([
        angular2_1.Component({
            selector: 'rpg-app'
        }),
        angular2_1.View({
            template: "\n    <style>@import url(./app.css);</style>\n    <h1>{{name}}</h1>\n    <content></content>\n    <!--<ul>-->\n      <!--<li *ng-for=\"#cool of things\">-->\n        <!--{{cool}}-->\n      <!--</li>-->\n    <!--</ul>-->\n  ",
            directives: [angular2_1.NgFor]
        }), 
        __metadata('design:paramtypes', [])
    ], RPGAppComponent);
    return RPGAppComponent;
})();
angular2_1.bootstrap(RPGAppComponent);
//# sourceMappingURL=app.js.map