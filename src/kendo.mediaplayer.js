(function (f, define) {
    define(["./kendo.data", "./kendo.slider", "./kendo.toolbar"], f);
})(function () {

    var __meta__ = { // jshint ignore:line
        id: "mediaplayer",
        name: "MediaPlayer",
        category: "web",
        description: "",
        depends: ["data", "slider", "toolbar"]
    };

    (function ($, undefined) {
        var kendo = window.kendo,
        CHANGE = "change",
        END = "end",
        PAUSE = "pause",
        PLAY = "play",
        READY = "ready",
        TIMECHANGE = "timeChange",
        VOLUMECHANGE = "volumeChange", 
        FULLSCREEN_ENTER = "k-i-fullscreen-enter",
        FULLSCREEN_EXIT = "k-i-fullscreen-exit",
        MUTE = "k-i-volume-mute",
        LOW_VOLUME = "k-i-volume-low",
        HIGH_VOLUME = "k-i-volume-high",
        PROGRESS = "progress",
        ERROR = "error",
        STATE_PLAY = "k-i-play",
        STATE_PAUSE = "k-i-pause",
        TITLEBAR = "k-mediaplayer-titlebar",
        TITLE = "k-title",
        TOOLBAR = "k-mediaplayer-toolbar",
        SLIDER = "k-mediaplayer-seekbar",
        VOLUME_SLIDER = "k-mediaplayer-volume",
        MEDIA = "k-mediaplayer-media",
        PLAYLIST_OPEN = "k-i-playlist-open",
        PLAYLIST = "k-mediaplayer-playlist",
        OVERLAY = "k-mediaplayer-overlay",
        YTPLAYER = "k-mediaplayer-yt",
        YTPLAYER_ID = "ytplayer",
        DOT = ".",
        ui = kendo.ui,
        ns = ".kendoMediaPlayer",
        baseTime = new Date(1970,0,1),  
        timeZoneSec = baseTime.getTimezoneOffset() * 60;
        Widget = kendo.ui.Widget,
        timeFormats = { 
            short: "mm:ss",
            long: "HH:mm:ss"
        },
        template = kendo.template,
        extend = $.extend,
        proxy = $.proxy,
        //each = $.each,
        templates = {
            htmlPlayer: "<video class='" + MEDIA + "'> </video>",
            titleBar: template("<div class='" + TITLEBAR + "'><span class='" + TITLE + "'>Video Title</span> #= renderPlaylistButton(data) # </div>"),
            toolBar: "<div class='" + TOOLBAR + "'> </div>",
            youtubePlayer: "<div class='" + YTPLAYER + "' id='ytplayer'> </div>",
            toolBarTime: "<span id='currentTime'>00:00:00</span> / <span id='duration'>00:00:00</span>",
            slider: "<input class='" + SLIDER + "' value='0' />",
            volumeSlider: "<input class='" + VOLUME_SLIDER + "'/>",
            toolTip: "#= kendo.toString(new Date(value), 'HH:mm:ss') #",
            playlistButton: "<a role='button' class='k-icon k-font-icon " + PLAYLIST_OPEN + "' style='float: right;''>Open Playlist</a>",
            playlist: template("<div style='height: 286px; margin-right: -280px;'' class='" + PLAYLIST + "'>" + 
                                    "<ul class='k-list'>" +
                                        "#= renderPlaylistItems(data) #" +
                                    "</ul>" +
                                "</div>"),
            playlistItem: template("<li class='k-list-item k-active-item'>" +
                                        "<a title='#= title #' href='\\#'>" +
                                            "<span class='k-image-wrap'>" +
                                                "<img alt='#= poster #' src='#= poster #'>" +
                                            "</span>" +
                                            "<span class='k-title'>#= title #</span></a></li>")
        },
        rendering = {
            renderPlaylistButton: function (options) {
              if (options.playlist && !(options.playlist.button === false)) {
                  return templates.playlistButton;
              }
              return "";
            },

            renderPlaylistItems: function (data) {
                var html = "",
                    i = 0;
                
                for (i; i < data.length; i++) {
                    var item = data[i];
                    html += templates.playlistItem({
                                title: item.title,
                                poster: item.poster
                            });
                }

                return html;
            }
        },
        DataSource = kendo.data.DataSource;

        var MediaPlayer = Widget.extend({
            init: function (element, options) {
                wrapper = $(element),

                options = $.isArray(options) ? { dataSource: options } : options;

                Widget.fn.init.call(this, element, options);

                wrapper.addClass("k-mediaplayer k-widget");
            
                options = this.options;
                
                //this._initializePlayer(options);

                this._createTitlebar(options);

                this._createToolbar(options);

                this._createSlider();

                this._createVolumeSlider(options);

                this._dataSource();

                this._timers = {};

                if (this.options.autoBind) {
                    this.dataSource.fetch();
                }

                kendo.notify(this);
            },

            events: [
                END,
                PAUSE,
                PLAY,
                READY,
                TIMECHANGE,
                VOLUMECHANGE    
            ],

            options: {
                name: "MediaPlayer",
                autoBind: true,
                autoPlay: false,
                autoRepeat: false,
                volume: 100,
                fullScreen: false,
                mute: false,
                forwardSeek: true,
                playlist: false
            },

            _initData: function (options) {
                if (options.dataSource) {
                }
            },

            setDataSource: function (dataSource) {
                this.options.dataSource = dataSource;
                this._dataSource();

                if (this.options.autoBind) {
                    dataSource.fetch();
                }
            },

            _msToTime: function(ms) {
                var time = new Date(baseTime.getTime());
                time.setSeconds(ms);
                return time;
            },

            _timeToSec: function(time) {
                var curTime = new Date(time).getTime();
                return curTime / 1000;
            },

            _createTitlebar: function(options) {
                this._titleBar = wrapper.find(DOT + TITLEBAR);
                if (this._titleBar.length === 0) {
                    this._playlistButtonClickHandler = proxy(this._playlistButtonClick, this);
                    wrapper.append(templates.titleBar(extend(options, rendering)));
                    wrapper.find(DOT + PLAYLIST_OPEN).on("click" + ns, this._playlistButtonClickHandler);
                    this._titleBar = wrapper.find(DOT + TITLEBAR);
                }
            },

            _playlistButtonClick: function () {
                wrapper.find(DOT + PLAYLIST).toggle();
            },

            _createSlider: function() {
                var sliderElement = wrapper.find(DOT + SLIDER);
                if (!this._slider) {
                    this._sliderDragChangeHandler = proxy(this._sliderDragChange, this);
                    this._sliderDraggingHandler = proxy(this._sliderDragging, this);
                    sliderElement = wrapper.find(DOT + SLIDER);

                    this._slider = new ui.Slider(sliderElement[0], {
                        smallStep: 1000,
                        tickPlacement: "none",
                        showButtons: false,
                        change: this._sliderDragChangeHandler,
                        slide: this._sliderDraggingHandler,
                        tooltip: {
                            template: templates.toolTip
                        }
                    });
                }
            },

            _createVolumeSlider: function(options) {
                var volumeSliderElement = wrapper.find(DOT + VOLUME_SLIDER);
                if (!this._volumeSlider) {
                    this._volumeDraggingHandler = proxy(this._volumeDragging, this);
                    this._volumeChangeHandler = proxy(this._volumeChange, this);
                    volumeSliderElement = $(DOT + VOLUME_SLIDER);
                    volumeSliderElement.width(50);
                    this._volumeSlider = new ui.Slider(volumeSliderElement[0], {
                        smallStep: 1,
                        min: 0,
                        max: 100,
                        value : this.options.volume,
                        slide: this._volumeDraggingHandler,
                        change: this._volumeChangeHandler,
                        tickPlacement: "none",
                        showButtons: false
                    });
                }
            },

            _createPlaylist: function (data) {
                var playlistElement = wrapper.find(DOT + PLAYLIST);
                if (playlistElement.length === 0) {
                    this._playlistItemClickHandler = proxy(this._playlistItemClick, this);
                    wrapper.append(templates.playlist(extend(this.options, { data: data }, rendering)));
                    wrapper.find(DOT + PLAYLIST + "> ul > li").on("click" + ns, this._playlistItemClickHandler);
                    if (this.options.playlist.hidden) {
                        wrapper.find(DOT + PLAYLIST).hide();
                    }
                }
            },

            _resetTime: function(){
                if(this._youTubeVideo) {
                    this._ytmedia.seekTo(0, true);
                } else{
                    this._media.currentTime = 0;
                }
                
                this._mediaTimeUpdate();
                $.grep(this._toolBar.options.items, function(e) { return !!e.template; }).template = templates.toolBarTime; 
            },

            _isYouTubeUrl: function (url) {
                return !!url.match("youtube.com/|youtu.be/");
            },

            _changePlayerUrl: function (url) {
                var oldPlayer = this._youTubeVideo;
                this.stop();

                this._youTubeVideo = this._isYouTubeUrl(url); 

                if (oldPlayer !== this._youTubeVideo) {
                        wrapper.find(DOT + YTPLAYER).toggle();
                        wrapper.find(DOT + MEDIA).toggle();
                }

                this._currentUrl = url;

                if (this._youTubeVideo) {
				    this._ytmedia.loadVideoById(this._getMediaId());
                } 
                else {
                    if (!this._media) {
                        this._initializePlayer(this.options);
                    }
                    wrapper.find(DOT + MEDIA + " > source").remove();
                    wrapper.find(DOT + MEDIA).attr("src", url);
                }
            },

            _playlistItemClick: function (e) {
                var item = $(e.target).parents("li");
                var data = this.dataSource.data();
                var currentItem = data[item.index()];
                if (currentItem) {
                    this._updateToolbarTitle(currentItem);
                    this._resetTime();
                    this._currentItem = currentItem.uid;
                    this._changePlayerUrl(currentItem.url);

                    this.play();
                }
            },

            _createToolbar: function (options) {
                var toolBarElement = wrapper.find(DOT + TOOLBAR);
                if (toolBarElement.length === 0) { 
                    this._toolbarClickHandler = proxy(this._toolbarClick, this);                    
                    wrapper.append(templates.toolBar);
                    toolBarElement = $(DOT + TOOLBAR);
                    toolBarElement.width($(DOT + MEDIA).width());
                    var context = this;
                    this._toolBar = new ui.ToolBar(toolBarElement, {
                        click: this._toolbarClickHandler,
                        resizable: false,
                        items: [
                            { 
                                id: "seekBarTemplate",
                                template: templates.slider
                            },
                            { type: "button", id: "play", spriteCssClass: "k-icon k-font-icon k-i-play" },
                            { type: "button", id: "volume", spriteCssClass: "k-icon k-font-icon k-i-volume-high" },
                            { 
                                id: "volumeTemplate",
                                template: templates.volumeSlider
                            },
                            { 
                                id: "timeTemplate",
                                template: templates.toolBarTime
                            },
                            { type: "button", id: "fullscreen", spriteCssClass: "k-icon k-font-icon k-i-fullscreen-enter" },
                            { type: "button", id: "hdbutton", spriteCssClass: "k-icon k-font-icon k-i-HD" }
                        ]
                    });
                    toolBarElement.width("auto");
                    currentTimeElement = toolBarElement.find("#currentTime");
                    durationElement = toolBarElement.find("#duration");
                    if (options.autoPlay) {
                        wrapper.find("#play").children().first()
                            .removeClass(STATE_PLAY)
                            .addClass(STATE_PAUSE); 
                    }

                    this._playButton = toolBarElement.find("#play.k-button.k-button-icon span");
                } 
            },

            _updateToolbarTitle: function (item) {
                var title = wrapper.find(DOT + TITLEBAR + ">" + DOT + TITLE);
                title.text(item.title);
            },

            _toolbarClick: function (e) {
                var target = $(e.target).children().first();
                var isPaused = this._paused;

                if (e.id === "play") {
                    if (isPaused) {
                        this.play();
                    } 
                    else {
                        this.pause();
                    }
                }

                if(e.id === "fullscreen"){
                    if(this._isInFullScreen){
                        target
                            .removeClass(FULLSCREEN_EXIT)
                            .addClass(FULLSCREEN_ENTER);
                       this.fullScreen(false);
                    } else {
                        target
                            .removeClass(FULLSCREEN_ENTER)
                            .addClass(FULLSCREEN_EXIT);
                        this.fullScreen(true);
                    }
                }

                if (e.id === "volume") {
                    var muted = (this._media && this._media.muted) || this._ytmedia.isMuted();
                    this.mute(!muted);
                }

                if (e.id === "hdbutton") {
                    this._toggleHD();
                }
            },

            _toggleHD: function(e) {
                var currentItem = this.dataSource.getByUid(this._currentItem);
                var media = $(this._media);
                var isHD = currentItem.hdurl === media.attr("src");
                var currentTime = this._media.currentTime;
                if (currentItem.hdurl && currentItem.hdurl.length > 0) {
                    media.attr("src",  isHD ? currentItem.url : currentItem.hdurl);
                    this._media.currentTime = currentTime;
                }
            },

            _sliderDragging: function(e) {
                if(!this.options.forwardSeek && (e.sender.value() < e.value)) {
                    this._shouldCancelSlideChange = true;
                    this._sliderValue = e.sender.value();
                }
                this._isDragging = true;
            },

            _sliderDragChange: function(e) {
                var that = this;
                var slider = e.sender;
                var tzOffset = timeZoneSec * 1000;
                that._isDragging = false;
                if(that._shouldCancelSlideChange) {
                    setTimeout(function() {
                        that._shouldCancelSlideChange = false;
                        slider.value(that._sliderValue);
                    },1);
                }else if(this._youTubeVideo) {
                    that._ytmedia.seekTo(that._timeToSec(e.value - tzOffset));
                }else{
                    that._media.currentTime = that._timeToSec(e.value - tzOffset);
                }
            },

            _changeVolumeButtonImage:function(volume)
            {
                var $volumeElement = this.toolbar().element.find("#volume > span");
                var cssClass = this.toolbar().element.find("#volume > span").attr("class");
                cssClass = cssClass.substring(0, cssClass.lastIndexOf(" "));

                if(volume === 0)
                {
                    $volumeElement.attr("class",cssClass + " " + MUTE);
                }else if(volume > 0 && volume < 51){
                    $volumeElement.attr("class",cssClass + " " + LOW_VOLUME);
                }else{
                    $volumeElement.attr("class",cssClass + " " + HIGH_VOLUME);
                }
            },

            _volumeDragging: function(e) {
                this.volume(e.value);
                this._changeVolumeButtonImage(e.value);
            },

            _volumeChange: function(e) {
                this.volume(e.value);
                this._changeVolumeButtonImage(e.value);
            },

            _mediaTimeUpdate: function(e) {
                var currentTime = (this._youTubeVideo)? this._ytmedia.getCurrentTime(): this._media.currentTime;
                var timeInMs = this._msToTime(currentTime);
                currentTimeElement.text(kendo.toString(timeInMs, this._timeFormat));
                if (!this._isDragging) {
                    this._slider.value((currentTime + timeZoneSec) * 1000);
                }
                return this.isPlaying();
            },

            _mediaDurationChange: function(e) {
                var durationTime = this._msToTime((this._youTubeVideo)? this._ytmedia.getDuration() : this._media.duration);

                this._timeFormat = durationTime.getHours() === 0 ? timeFormats.short : timeFormats.long;

                durationElement.text(kendo.toString(durationTime, this._timeFormat));
                this._slider.setOptions({
                    min: baseTime.getTime(),
                    max: durationTime.getTime()
                });
                this._slider._distance = Math.round(this._slider.options.max - this._slider.options.min);
                this._slider._resize();

                if (!this._isFirstRun) {
                    this._resetTime();
                    this._isFirstRun = true;
                }
            },

            _createYoutubePlayer: function (options) {
                this._mediaTimeUpdateHandler = proxy(this._mediaTimeUpdate, this);
                this._mediaDurationChangeHandler = proxy(this._mediaDurationChange, this);

                this._videoOverlay.after(templates.youtubePlayer);
                this._ytPlayer = wrapper.find(DOT + YTPLAYER)[0];
                $(this._ytPlayer)
                    .css({
                        width: wrapper.width(),
                        height: wrapper.height() 
                    });

                if (!window.YT || !window.YT.Player)
                {
                    $.getScript("https://www.youtube.com/iframe_api");
                    this._youtubeApiReadyHandler = proxy(this._youtubeApiReady, this);
                    window.onYouTubeIframeAPIReady = this._youtubeApiReadyHandler;
                }
                else
                {
                    this._configurePlayer(options);
                }
            },

            _poll: function (name, callback, interval, context)
            {
                var that = this;

                if (that._timers[name] != null)
                {
                    clearTimeout(that._timers[name]);
                }

                that._timers[name] = setTimeout((function (context)
                {
                    return function callLater()
                    {
                        if (callback.call(context))
                        {
                            that._timers[name] = setTimeout(callLater, interval);
                        }
                    };
                })(context), interval);

                return that._timers[name];
            },

            _youtubeApiReady: function () {
                this._configurePlayer(this.options);
            },

            _configurePlayer: function (options) {
                var vars = {
                    'autoplay': +options.autoPlay,
                    'wmode': 'transparent',
                    'controls': 0,
                    'rel': 0,
                    'showinfo': 0
                };

                this._onYouTubePlayerReady = proxy(this._onYouTubePlayerReady, this);
                this._onPlayerStateChangeHandler = proxy(this._onPlayerStateChange, this);

                /*jshint unused:false */
                var player = new window.YT.Player(YTPLAYER_ID, {
                    height: wrapper.height(),
                    width: wrapper.width(),
                    videoId: this._getMediaId(),
                    playerVars: vars,
                    events: {
                        'onReady': this._onYouTubePlayerReady,
                        'onStateChange': this._onPlayerStateChangeHandler
                    }
                });
            },

            _onYouTubePlayerReady: function (event){
                this._ytmedia = event.target;
                this._ytmedia.getIframe().style.width = "100%";
                this._ytmedia.getIframe().style.height = "100%";
                this._youTubeVideo = true;
                this._mediaDurationChangeHandler();
            },

            _onPlayerStateChange: function (event){
                //IF NECESSARY
                //check event.data = 0,1,2,5 for current player state and modify UI / fire events depending on the state 
                if (event.data === 0) {		
				    //this._ytmedia.cueVideoById(this._getMediaId(extend(this.options, { ytFile: this.dataSource.getByUid(this._currentItem) })));
                    this._ytmedia.seekTo(0, true);
				    this.pause();
				    this._slider.value(0);
                    this.trigger(END);
                }
                else if (event.data === 1) {
                    this._ytmedia.setVolume(this.volume());
                    this._ytmedia.playVideo();
                    this.trigger(PLAY);
                    this._poll("progress", this._mediaTimeUpdate, 500, this);
                    this._paused = false; 
                }
                else if (event.data === 2) {
                    this._ytmedia.pauseVideo();
                    this.trigger(PAUSE);
                    this._paused = true;
                }
                else if (event.data === 5) {
                    this.trigger(READY);
                }
            },

            _getMediaId: function (){
                var result = this._currentUrl;
                var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
                var match = result.match(regExp);

                if (match && match[7].length == 11) {
                    result = match[7];
                }

                return result;
            },

            _mouseClick: function(e) {
                if (this.isPaused()) {
                     this.play();
                } else {
                    this.pause();
                }
            },

            _initializePlayer: function (options) {
                if (!this._mouseMoveHandler) {
                    this._mouseMoveHandler = proxy(this._mouseMove, this);
                    this._mouseInHandler = proxy(this._mouseIn, this);
                    this._mouseOutHandler = proxy(this._mouseOut, this);

                    $(wrapper)
                        .on("mouseenter" + ns , this._mouseInHandler)
                        .on("mouseleave" + ns , this._mouseOutHandler)
                        .on("mousemove" + ns , this._mouseMoveHandler);
                }

                if (!this._videoOverlay) {
                    this._mouseClickHanlder = proxy(this._mouseClick, this);
                    wrapper.append("<div class='" + OVERLAY + "'></div>");
                    this._videoOverlay = wrapper.find(".k-mediaplayer-overlay")
                        .on("click" + ns, this._mouseClickHanlder);
                }    

                if (this._youTubeVideo) {
                    this._createYoutubePlayer(this.options);
                } 
                else {
                    this._createHtmlPlayer(this.options);
                }
            },

            _createHtmlPlayer: function (options) {
                this._mediaTimeUpdateHandler = proxy(this._mediaTimeUpdate, this);
                this._mediaDurationChangeHandler = proxy(this._mediaDurationChange, this);
                this._videoOverlay.after(templates.htmlPlayer);
                this._media = wrapper.find(DOT + MEDIA)[0];
                $(this._media)
                    .css({
                        width: "100%",
                        height: "100%" 
                    });
					
                if (options.autoPlay) {
                    $(this._media).attr("autoplay", "");  
                }

                this._media.muted = options.mute;

                this._media.ontimeupdate = this._mediaTimeUpdateHandler;
                this._media.ondurationchange = this._mediaDurationChangeHandler;
            },

            _mouseIn: function (e) {
                this._uiDisplay(true);
            },

            _mouseOut: function (e) {
                this._poll("mouseIdle", this._mouseIdle, 3000, this);
            },

            _mouseIdle: function () {
                this._uiDisplay(false);
                return false;
            },

            _mouseMove: function (e) {
                if(!(this._titleBar.is(':animated') || this._toolBar.element.is(':animated') || this._slider.wrapper.is(':animated'))){
                    this._uiDisplay(true);
                }
                this._poll("mouseIdle", this._mouseIdle, 3000, this);
            },

            _uiDisplay: function (state) {
                var animationSpeed = 'slow';
                //titleBar.stop().animate({opacity:state}, animationSpeed);
                this._titleBar.stop().animate({opacity:+state}, animationSpeed);
                this._toolBar.element.stop().animate({opacity:+state}, animationSpeed);
                this._slider.wrapper.stop().animate({opacity:+state}, animationSpeed);
            },


            setOptions: function (options) {
                if ("dataSource" in options) {
                    this._initData(options);
                }
                Widget.fn.setOptions.call(this, options);
            },

            destroy: function () {
                Widget.fn.destroy.call(this);

                if (!this.isPaused()) {
                    this.pause();
                }

                this.element.off(ns);
                this.element.find(DOT + PLAYLIST + "> ul > li").off(ns);
                this.element.find(DOT + PLAYLIST_OPEN).off(ns);
                this.element.find(DOT + OVERLAY).off(ns);
                this._timers = null;
                this._mouseMoveHandler = null;
                this._mouseOutHandler = null;
                this._mouseInHandler = null;
                this._mouseClickHanlder = null;

                this._unbindDataSource();

                this._playlistItemClickHandler = null;
                this._playlistButtonClickHandler = null;

                this._toolbarClickHandler = null;
                this._sliderDragChangeHandler = null;
                this._sliderDraggingHandler = null;
                this._volumeDraggingHandler = null;
                this._volumeChangeHandler = null;
                this._youtubeApiReadyHandler = null;
                this._onYouTubePlayerReady = null;
                this._onPlayerStateChangeHandler = null;

                this._media.ontimeupdate = this._mediaTimeUpdateHandler = null;
                this._media.ondurationchange = this._mediaDurationChangeHandler = null;

                if (this._youTubeVideo) {
                    this._ytmedia.destroy();
                } 
                else {
                    this._media.src = "";
                    this._media.remove();
                }

                this._mouseMoveTimer = null;
                clearTimeout(this._mouseMoveTimer);

                kendo.destroy(this.element);
            },

            seek: function (ms) {
                var seconds = ms / 1000;
                if (this._youTubeVideo) {
                    if (seconds + 3 >= this._media.getDuration() | 0) {
        		        //avoid infinite bad request loop in youtube player.
        		        this._media.seekTo(this._media.getDuration() - 3 | 0, true);
        	        } else {
        		        this._media.seekTo(seconds, true);
        	        }
                } else {
                    this._media.currentTime = seconds;
                }
                
                return this;
            },

            play: function () {
                if(this._youTubeVideo){
                    this._ytmedia.playVideo();
                } else{
                    this._media.play();
                }
                this._paused = false;

                this._playButton
                    .removeClass(STATE_PLAY)
                    .addClass(STATE_PAUSE); 

                return this;
            },

            stop: function() {
                if (this._youTubeVideo){
                    this._ytmedia.stopVideo();
                } else{
                    this._media.pause();
                    this._media.currentTime = 0;
                }
                this._paused = true;

                this._playButton
                    .removeClass(STATE_PAUSE)
                    .addClass(STATE_PLAY);   

                return this;
            },

            pause: function () {
                if(this._youTubeVideo){
                    this._ytmedia.pauseVideo();
                }else{
                    this._media.pause();
                }
                this._paused = true;

                this._playButton
                    .removeClass(STATE_PAUSE)
                    .addClass(STATE_PLAY);   

                return this;
            },

            toolbar: function() {
                return this._toolBar;
            },

            titlebar: function() {
                return this._titleBar;
            },

            fullScreen: function (enterFullScreen) {
                var element = this.element.get(0);
                if(enterFullScreen){
                    this._width = this.element.width();
                    this._height = this.element.height();
                    // Handles the case when the action is triggered by code and not user iteraction
                    this.element.width("100%").height("100%").css({
                         position: "fixed",
                         top: 0,
                         left: 0
                    });
                    if (element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if (element.webkitRequestFullscreen) {
                        element.webkitRequestFullscreen();
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if (element.msRequestFullscreen) {
                        element.msRequestFullscreen();
                    } 
                    this._isInFullScreen = true;
                }else{
                    
                    if (document.cancelFullscreen) {
                        document.cancelFullscreen();
                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msCancelFullscreen) {
                        document.msCancelFullscreen();
                    } else if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                    // Handles the case when the action is triggered by code and not user iteraction
                    this.element.css({
                        position: "relative",
                        top: null,
                        left: null
                    });
                    this.element.width(this._width);
                    this.element.height(this._height);
                    this._isInFullScreen = false;
                }
            },

            volume: function (value) { 
                if (typeof value === 'undefined') {
                    return (typeof this._volume !== 'undefined') ? this._volume: this._volume = this.options.volume;
                }
                this._volume = value; 
                if(this._youTubeVideo){
                    this._ytmedia.setVolume(this._volume);
                }else{
                    this._media.volume = this._volume / 100;
                }

                this._volumeSlider.value(value);
            },

            mute: function (muted) { 
                if (typeof muted === 'undefined') {
                    return (this._media && this._media.muted) || this._ytmedia.isMuted();
                }
                if (this._youTubeVideo) {
                    if (muted) {
                        this._ytmedia.mute();
                    }
                    else {
                        this._ytmedia.unMute();
                    }
                }
                else {
                    this._media.muted = muted;
                }

                if (muted) {
                    this._volumeSlider.value(0);
                }
                else {
                    this._volumeSlider.value((this._media && this._media.volume) || this._ytmedia.getVolume());
                }
                this._changeVolumeButtonImage(this._volumeSlider.value());
            },

            isEnded: function () {
                var currentTime = this._youTubeVideo ? this._ytmedia.getCurrentTime(): this._media.currentTime;
                var durationTime = this._youTubeVideo ? this._ytmedia.getDuration() : this._media.duration;

                return (this._paused && currentTime === durationTime);
            },

            isPaused: function () {
                return this._paused;
            },

            isPlaying: function () {
                return !this._paused;
            },

            _dataSource: function () {
                if (this.dataSource && this._refreshHandler) {
                    this._unbindDataSource();
                } else {
                    this._refreshHandler = proxy(this._refresh, this);
                    this._progressHandler = proxy(this._progress, this);
                    this._errorHandler = proxy(this._error, this);
                }

                this.dataSource = DataSource.create(this.options.dataSource)
                                    .bind(CHANGE, this._refreshHandler)
                                    .bind(PROGRESS, this._progressHandler)
                                    .bind(ERROR, this._errorHandler);
            },

            _unbindDataSource: function () {
                this.dataSource.unbind(CHANGE, this._refreshHandler)
                                .unbind(PROGRESS, this._progressHandler)
                                .unbind(ERROR, this._errorHandler);
            },

            _refresh: function () {
                var data = this.dataSource.data();
                if (data && data[0]) {                    
                    this._currentItem = data[0].uid;
                    this._currentUrl = data[0].url;

                    if (this.options.playlist) {
                        this._createPlaylist(data);
                    }

                    this._updateToolbarTitle(data[0]);
                    this._youTubeVideo = this._isYouTubeUrl(this._currentUrl);
                    if (this._youTubeVideo) {
                        this._initializePlayer(this.options);                                            
                    }

                    // var sourceElement = document.createElement("source");
                    // sourceElement.setAttribute("src", data[0].url);
                    // wrapper.find(DOT + MEDIA).append(sourceElement);
                }
            },

            _error: function () {
            },

            _progress: function () {
            }

        });

        ui.plugin(MediaPlayer);

    })(window.kendo.jQuery);

    return window.kendo;

}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) { (a3 || a2)(); });
