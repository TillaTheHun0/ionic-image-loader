import { Component, ElementRef, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
import { ImageLoader } from '../providers/image-loader';
import { ImageLoaderConfig } from '../providers/image-loader-config';
var propMap = {
    display: 'display',
    height: 'height',
    width: 'width',
    backgroundSize: 'background-size',
    backgroundRepeat: 'background-repeat'
};
var ImgLoaderComponent = (function () {
    function ImgLoaderComponent(eRef, renderer, imageLoader, config) {
        this.eRef = eRef;
        this.renderer = renderer;
        this.imageLoader = imageLoader;
        this.config = config;
        /**
           * Fallback URL to load when the image url fails to load or does not exist.
           */
        this.fallbackUrl = this.config.fallbackUrl;
        /**
           * Whether to show a spinner while the image loads
           */
        this.spinner = this.config.spinnerEnabled;
        /**
           * Whether to show the fallback image instead of a spinner while the image loads
           */
        this.fallbackAsPlaceholder = this.config.fallbackAsPlaceholder;
        /**
           * Enable/Disable caching
           * @type {boolean}
           */
        this.cache = true;
        /**
           * Width of the image. This will be ignored if using useImg.
           */
        this.width = this.config.width;
        /**
           * Height of the image. This will be ignored if using useImg.
           */
        this.height = this.config.height;
        /**
           * Display type of the image. This will be ignored if using useImg.
           */
        this.display = this.config.display;
        /**
           * Background size. This will be ignored if using useImg.
           */
        this.backgroundSize = this.config.backgroundSize;
        /**
           * Background repeat. This will be ignored if using useImg.
           */
        this.backgroundRepeat = this.config.backgroundRepeat;
        /**
           * Name of the spinner
           */
        this.spinnerName = this.config.spinnerName;
        /**
           * Color of the spinner
           */
        this.spinnerColor = this.config.spinnerColor;
        /**
           * Notify on image load..
           */
        this.load = new EventEmitter();
        /**
           * Indicates if the image is still loading
           * @type {boolean}
           */
        this.isLoading = true;
        this._useImg = this.config.useImg;
    }
    Object.defineProperty(ImgLoaderComponent.prototype, "src", {
        get: function () {
            return this._src;
        },
        set: /**
           * The URL of the image to load.
           */
        function (imageUrl) {
            this._src = this.processImageUrl(imageUrl);
            this.updateImage(this._src);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImgLoaderComponent.prototype, "useImg", {
        set: /**
           * Use <img> tag
           */
        function (val) {
            this._useImg = val !== false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImgLoaderComponent.prototype, "noCache", {
        set: /**
           * Convenience attribute to disable caching
           * @param val
           */
        function (val) {
            this.cache = val !== false;
        },
        enumerable: true,
        configurable: true
    });
    ImgLoaderComponent.prototype.ngOnInit = function () {
        if (this.fallbackAsPlaceholder && this.fallbackUrl) {
            this.setImage(this.fallbackUrl, false);
        }
        if (!this.src) {
            // image url was not passed
            // this can happen when [src] is set to a variable that turned out to be undefined
            // one example could be a list of users with their profile pictures
            // in this case, it would be useful to use the fallback image instead
            // if fallbackUrl was used as placeholder we do not need to set it again
            if (!this.fallbackAsPlaceholder && this.fallbackUrl) {
                // we're not going to cache the fallback image since it should be locally saved
                this.setImage(this.fallbackUrl);
            }
            else {
                this.isLoading = false;
            }
        }
    };
    ImgLoaderComponent.prototype.updateImage = function (imageUrl) {
        var _this = this;
        this.imageLoader
            .getImagePath(imageUrl)
            .then(function (url) { return _this.setImage(url); })
            .catch(function (error) { return _this.setImage(_this.fallbackUrl || imageUrl); });
    };
    /**
     * Gets the image URL to be loaded and disables caching if necessary
     * @returns {string}
     */
    /**
       * Gets the image URL to be loaded and disables caching if necessary
       * @returns {string}
       */
    ImgLoaderComponent.prototype.processImageUrl = /**
       * Gets the image URL to be loaded and disables caching if necessary
       * @returns {string}
       */
    function (imageUrl) {
        if (this.cache === false) {
            // need to disable caching
            if (imageUrl.indexOf('?') === -1) {
                // add ? if doesn't exists
                imageUrl += '?';
            }
            if (['&', '?'].indexOf(imageUrl.charAt(imageUrl.length)) === -1) {
                // add & if necessary
                imageUrl += '&';
            }
            // append timestamp at the end to make URL unique
            imageUrl += 'cache_buster=' + Date.now();
        }
        return imageUrl;
    };
    /**
     * Set the image to be displayed
     * @param imageUrl {string} image src
     * @param stopLoading {boolean} set to true to mark the image as loaded
     */
    /**
       * Set the image to be displayed
       * @param imageUrl {string} image src
       * @param stopLoading {boolean} set to true to mark the image as loaded
       */
    ImgLoaderComponent.prototype.setImage = /**
       * Set the image to be displayed
       * @param imageUrl {string} image src
       * @param stopLoading {boolean} set to true to mark the image as loaded
       */
    function (imageUrl, stopLoading) {
        var _this = this;
        if (stopLoading === void 0) { stopLoading = true; }
        this.isLoading = !stopLoading;
        if (this._useImg) {
            // Using <img> tag
            if (!this.element) {
                // create img element if we dont have one
                this.element = this.renderer.createElement(this.eRef.nativeElement, 'img');
            }
            // set it's src
            this.renderer.setAttribute(this.element, 'src', imageUrl);
            if (this.fallbackUrl && !this.imageLoader.nativeAvailable) {
                this.renderer.listen(this.element, 'error', function () {
                    return _this.renderer.setAttribute(_this.element, 'src', _this.fallbackUrl);
                });
            }
        }
        else {
            // Not using <img> tag
            this.element = this.eRef.nativeElement;
            for (var prop in propMap) {
                if (this[prop]) {
                    this.renderer.setStyle(this.element, propMap[prop], this[prop]);
                }
            }
            this.renderer.setStyle(this.element, 'background-image', "url(\"" + (imageUrl || this.fallbackUrl) + "\")");
        }
        this.load.emit(this);
    };
    ImgLoaderComponent.decorators = [
        { type: Component, args: [{
                    selector: 'img-loader',
                    template: '<ion-spinner *ngIf="spinner && isLoading && !fallbackAsPlaceholder" [name]="spinnerName" [color]="spinnerColor"></ion-spinner>' +
                        '<ng-content></ng-content>',
                    styles: [
                        'ion-spinner { float: none; margin-left: auto; margin-right: auto; display: block; }'
                    ]
                },] },
    ];
    /** @nocollapse */
    ImgLoaderComponent.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: Renderer2, },
        { type: ImageLoader, },
        { type: ImageLoaderConfig, },
    ]; };
    ImgLoaderComponent.propDecorators = {
        "fallbackUrl": [{ type: Input },],
        "spinner": [{ type: Input },],
        "fallbackAsPlaceholder": [{ type: Input },],
        "cache": [{ type: Input },],
        "width": [{ type: Input },],
        "height": [{ type: Input },],
        "display": [{ type: Input },],
        "backgroundSize": [{ type: Input },],
        "backgroundRepeat": [{ type: Input },],
        "spinnerName": [{ type: Input },],
        "spinnerColor": [{ type: Input },],
        "load": [{ type: Output },],
        "src": [{ type: Input },],
        "useImg": [{ type: Input },],
        "noCache": [{ type: Input },],
    };
    return ImgLoaderComponent;
}());
export { ImgLoaderComponent };
//# sourceMappingURL=img-loader.js.map