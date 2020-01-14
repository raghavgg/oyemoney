var _bsa = {
    
    init: function(format, zoneKey, segment, options) 
    {
        var options = typeof options !== 'undefined' ? options : false;
				
		if(!this.isset(window['_bsa_queue']))
			window['_bsa_queue'] = [];
				
		// if no target is specified, we target the body
		if(!this.isset(options.target))
		{
			if(options === false)
				options = new Object();
			
			options.target = 'body';
		}
		
		if(this.isset(options) && this.isset(options.target) && document.querySelectorAll(options.target).length > 0)
		{
			// test stuff
			var forcebanner = this.getURLVar('bsaforcebanner', window.location.href),
				ignore = this.getURLVar('bsaignore', window.location.href),
				forwardedip = this.getURLVar('bsaforwardedip', window.location.href);
				ignoretargeting = this.getURLVar('bsaignoretargeting', window.location.href);
						
	    	var srv = document.createElement('script');
	    		srv.id = '_bsa_srv-' + zoneKey + '_' + window['_bsa_queue'].length; // we need to set something here so that we can access this script later if needed
	    	    srv.type = 'text/javascript';
	    	    srv.src = (options && options.path) ? options.path : '//srv.buysellads.com/ads/' + zoneKey + '.json';
	    	    srv.src = this.appendQueryString(srv.src, 'callback', '_bsa_go');
			
			// we pass this through so that we can remove it later when reloading the ad
			options.script_id = srv.id;

	    	if(segment)
	    		srv.src = this.appendQueryString(srv.src, 'segment', segment);
	    		
	    	if(options && this.isset(options.ip))
	    		srv.src = this.appendQueryString(srv.src, 'forwardedip', options.ip);
	    	
	    	if(options && this.isset(options.country))
	    		srv.src = this.appendQueryString(srv.src, 'country', options.country);
	    		
	    	if(options && this.isset(options.number_of_ads))
	    		srv.src = this.appendQueryString(srv.src, 'forcenads', options.number_of_ads);
	    	
	    	// append test data if we have it
	    	if(forcebanner)
	    		srv.src = this.appendQueryString(srv.src, 'forcebanner', forcebanner);
	    		
	    	if(ignore)
	    		srv.src = this.appendQueryString(srv.src, 'ignore', ignore);
	    		
	    	if(ignoretargeting)
	    		srv.src = this.appendQueryString(srv.src, 'ignoretargeting', ignoretargeting);
	    		
	    	if(forwardedip)
	    		srv.src = this.appendQueryString(srv.src, 'forwardedip', forwardedip);
				
			if(options && !this.isset(options.platforms) || !this.isset(options))
				options.platforms = ['desktop', 'mobile'];
	
	    	if(_bsa[format].readyToInit != false || ( options && options.testMode ) || !_bsa.objExists(zoneKey))
	    		window['_bsa_queue'].push([format, zoneKey, segment, options]);
	    	
	    	if(options.forceReload)
	    		this.removeElement(document.getElementById(srv.id));
	    	
	    	if(_bsa[format].readyToInit != false && !options.testMode )
	    	{
	    		srv.src += this.frequencyCap();
	    		if(_bsa.objExists(zoneKey) && !_bsa.exists(document.getElementById(srv.id)))
	    			document.getElementsByTagName('head')[0].appendChild(srv);
	    	}
			else if( (options && options.testMode ) || !_bsa.objExists(zoneKey))
				_bsa_go(_bsa[format].testData);
			else
				_bsa[format](zoneKey, segment, options);
		}
		
    },
    
    frequencyCap: function ()
    {
		var day = _bsa.getCookie('_bsap_daycap'),
			life = _bsa.getCookie('_bsap_lifecap'),
			day = this.isset(day) ? day.split(';')[0].split(',') : [],
			life = this.isset(life) ? life.split(';')[0].split(',') : [];
	
		if (day.length || life.length) {
			var freqcap = [];
			for (var i = 0; i < day.length; i++) {
				var adspot = day[i];
	
				// using an array here is ugly, but safer cross-browser than for(var i in...) from an obj
				for (var found = -1, find = 0; find < freqcap.length && found == -1; find++)
				if (freqcap[find][0] == adspot) found = find;
				if (found == -1) freqcap.push([adspot, 1, 0]);
				else freqcap[found][1]++;
			}
			for (var i = 0; i < life.length; i++) {
				var adspot = day[i];
	
				// using an array here is ugly, but safer cross-browser than for(var i in...) from an obj
				for (var found = -1, find = 0; find < freqcap.length && found == -1; find++)
				if (freqcap[find][0] == adspot) found = find;
				if (found == -1) freqcap.push([adspot, 0, 1]);
				else freqcap[found][2]++;
			}

			for (var i = 0; i < freqcap.length; i++)
				freqcap[i] = freqcap[i][0] + ':' + freqcap[i][1] + ',' + freqcap[i][2];
		}
		
		if(freqcap && freqcap.length)
			return '&freqcap=' + encodeURIComponent(freqcap.join(';'));
		else
			return '';
    },
    
    appendQueryString: function (url, name, value)
    {
	    var re = new RegExp('([?&]' + name + '=)[^&]+', '');
	
	    function add(sep) {
	        url += sep + name + '=' + encodeURI(value);
	    }
	
	    function change() {
	        url = url.replace(re, '$1' + encodeURI(value));
	    }
	    if (url.indexOf('?') === -1) {
	        add('?');
	    } else {
	        if (re.test(url)) {
	            change();
	        } else {
	            add('&');
	        }
	    }
	    return url;
    },
    
    clearQueue: function(index)
    {
    	//window['_bsa_queue'].shift();
    	window['_bsa_queue'].splice(index, 1);
    },
    
    link: function (link, segment, domain, timestamp, clicktag)
    {
    	var l = link.split('?encredirect='),
    		fulllink;
    	
    	if(typeof l[1] != 'undefined')
    		fulllink = l[0] + '?segment=' + segment + ';&encredirect=' + encodeURIComponent(l[1]);
    	else if (l[0].search('srv.buysellads.com') > 0)
    		fulllink = l[0] + '?segment=' + segment + ';';
    	else
    		fulllink = l[0];

    	// insert pub-specific link & timestamp
    	fulllink = fulllink.replace('[placement]', segment);
    	fulllink = fulllink.replace('[timestamp]', timestamp);
    	
    	// swap in custom url if set
    	if(domain)
	    	fulllink = fulllink.replace(/srv.buysellads.com/g, domain);
    	
		// this will royally mess things up if/when we add "https:" to
		// the statlink in the ad server
    	return (_bsa.isset(clicktag) ? clicktag + 'https:' : '' ) + fulllink;
    },
    
    pixel: function(p, timestamp)
    {
    	var c = '';
    	
    	if(_bsa.isset(p)) {
    		
    		var pixels = p.split('||');
    		
    		for (var j = 0; j < pixels.length; j++)
    			c+= '<img src="' + pixels[j].replace('[timestamp]', timestamp) + '" style="display:none;" height="0" width="0" />';
    			
		}
		
    	return c;
    },
    
    findInQueue: function(key)
    {
    	for(i = 0; i < window['_bsa_queue'].length; i++)
    		if(window['_bsa_queue'][i][1] == key)
    			return i;
    },
    
    drop: function(output, target, elType, idName, attributes)
    {
    	var div = document.createElement(elType);
    		div.id = idName;
    		div.innerHTML = output;
    	
    	if(attributes)
    		div.setAttribute('data-attributes', JSON.stringify(attributes));
    		    		
   		var b = document.body.firstChild;
   		
   		// right now, this is specifically for the "recommended" ad type
   		// key difference is that we putting the output directly into
   		// the page vs wrapping it with all of the other stuff as we do
   		// for other units
   		if (target.indexOf('::clone::') >= 0) {
   			target = target.replace('::clone::', '');
   			document.querySelector(target).insertAdjacentHTML('beforebegin', output);
   			return;
   		}
    	
    	for(i = 0; i < document.querySelectorAll(target).length; i++)
    		if(target == 'body')
    			b.parentNode.insertBefore(div, b);
    		else {
    			if(attributes.options.clear_contents == true)
					document.querySelectorAll(target)[i].innerHTML = '';
				document.querySelectorAll(target)[i].appendChild(div);
			}
					
    },
    
    callback: function(a)
    {
    	typeof(BSANativeCallback) === 'function' ? BSANativeCallback(a) : function(){};
    },
    
    hide: function (e)
    {
    	if(document.getElementById(e))
    	{
            this.removeClass(document.getElementById(e), '_bsa_show');
            this.addClass(document.getElementById(e), '_bsa_hide');
        }
    },
    
    show: function (e)
    {
        if(document.getElementById(e))
        {
        	this.removeClass(document.getElementById(e), '_bsa_hide');
        	this.addClass(document.getElementById(e), '_bsa_show');
        }
    },
    
    close: function (e, t)
    {
    	this.hide(e);
    	if(this.isset(_bsa.setCookie))
    		_bsa.setCookie(e, 'hide', this.isset(t) ? t: 1000 * 60 * 60 * 24);
    },
    
    hasClass: function (el, name)
    {
        return new RegExp('(\\s|^)' + name + '(\\s|$)').test(el.className)
    },
    
    addClass: function (el, name)
    {
        if (!this.hasClass(el, name))
            el.className += (el.className ? ' ' : '') + name;
    },
    
    removeClass: function (el, name)
    {
        if (this.hasClass(el, name))
            el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
    },
    
    removeElement: function(el) 
    {
    	// this should probably accept an array of elements to remove...
    	if (typeof el !== 'undefined' && el != null)
    		el.parentNode.removeChild(el);
    },
    emptyElement: function(el) 
    {
    	// this should probably accept an array of elements to remove...
    	while(el.firstChild)
    		el.removeChild(el.firstChild);
    },
    
    reload: function(e)
    {
    	var el = document.querySelector(e);
    	
    	if (typeof el !== 'undefined' && el != null)
    	{
    		if(_bsa.isset(el.firstChild.getAttribute('data-attributes')))
    		{
    			var attributes = JSON.parse(el.firstChild.getAttribute('data-attributes'));
    			this.removeElement(document.getElementById(attributes.options.script_id));
    			this.emptyElement(el);
    		}
    		else
    		{
    			var attributes = JSON.parse(el.getAttribute('data-attributes'));
    			this.removeElement(document.getElementById(attributes.options.script_id));
    			this.removeElement(el);
    		}    			

    		this.init(attributes.type, attributes.key, attributes.segment, attributes.options);
    	}
    },
    
    isHex: function (c) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(c);
    },
    
    isMobile: function()
    {
    	var check = false;
    	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    	return check;
    },

	extend: function(target) {
	    for(var i=1; i<arguments.length; ++i) {
	        var from = arguments[i];
	        if(typeof from !== 'object') continue;
	        for(var j in from) {
	            if(from.hasOwnProperty(j)) {
	                target[j] = typeof from[j]==='object'
	                ? this.extend({}, target[j], from[j])
	                : from[j];
	            }
	        }
	    }
	    return target;
	},
    
    isset: function(v)
    {
    	return typeof v !== 'undefined' && v != null;
    },
    
    exists: function(el)
    {
        if (el === null)
        	return false;
	    return true;
    },
    
    objExists: function(obj)
    {
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        if (obj == null)
        	return false;
        if (obj.length > 0)
        	return true;
        if (obj.length === 0)
        	return false;
    
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj)
            if (hasOwnProperty.call(obj, key))
            	return true;
    
        return false;
    },
    
    getAttr: function(v, id)
    {	
    	return document.getElementById(id).getAttribute('data-' + v);
    },
    
    getURLVar: function (name, url)
    {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        
        var regexS = "[\\?&]" + name + "=([^&#]*)",
        	regex = new RegExp(regexS),
        	results = regex.exec(url);
        
        if (results == null)
        	return '';
        else
        	return results[1]
    },
    
    htmlEncode: function(v)
    {
    	if (typeof v === 'undefined')
    		v = '';
    	
    	return v
    		.replace(/&/g, '&amp;')
    		.replace(/"/g, '&quot;')
    		.replace(/'/g, '&apos;')
    		.replace(/</g, '&lt;')
    		.replace(/>/g, '&gt;')
    		.replace(/\//g, '&#x2F;');
    }
};

var _bsa_go = function(json) {
	
	var queue_index = _bsa.findInQueue(json['ads'][0].zonekey);
	if( window['_bsa_queue'][queue_index] )
	{
		// this use case here (letting the user easily define desktop/mobile/etc)
		// has not actually been used, but I haven't ripped it out yet
		// or taken time to better document how one might use it
		// I do think it is a useful use case... but it needs to be flushed
		// out a bit better before we encourage people to use it
		if(
			( window['_bsa_queue'][queue_index][3] && window['_bsa_queue'][queue_index][3].platforms.indexOf('mobile') > -1 && _bsa.isMobile() ) || 
			( window['_bsa_queue'][queue_index][3] && window['_bsa_queue'][queue_index][3].platforms.indexOf('desktop') > -1 && !_bsa.isMobile() )
			// TODO: add support for tablet
		)
		{
			if(_bsa.isset(json))
				for(i=json['ads'].length-1; i>=0; i--)
					if( !_bsa.isset(json['ads'][i].statlink) )
					{
						// this is for the callback when there aren't any ads to show
						// we still need to be able to pass back the zone key
						var attributes = {
							"format": window['_bsa_queue'][queue_index][0],
							"key": json['ads'][0].zonekey,
							"segment": window['_bsa_queue'][queue_index][2],
							"options": window['_bsa_queue'][queue_index][3],
							"fallback": json['ads'][0].fallbackZoneKey,
							"ads": []
						};
						// we remove the extra non-ad "ads" from the return here
						json['ads'].splice(i,1);
					}
			if( _bsa.isset(json) && _bsa.isset(json['ads']) && json['ads'].length > 0 && _bsa.isset(json['ads'][0].statlink) )
			{
				for (var i = 0; i < json['ads'].length; i++)
					_bsa_serving_callback(json['ads'][i].bannerid, json['ads'][i].zonekey, json['ads'][i].freqcap);
				
				_bsa[window['_bsa_queue'][queue_index][0]](window['_bsa_queue'][queue_index][1], window['_bsa_queue'][queue_index][2], window['_bsa_queue'][queue_index][3], json['ads']);

			}
			//we attempt the fallback key
			else if (_bsa.isset(attributes.fallback)) 
			{
				_bsa.clearQueue(_bsa.findInQueue(attributes.key));
				_bsa.init(attributes.format, attributes.fallback, attributes.segment, attributes.options);
			}
			// this is the options-specified carbon fallback case
			// primarily used in the IAB template and something that
			// can be phased out once Carbon/Native are merged
			else if (_bsa.isset(attributes.options.carbonfallback))
			{
				_bsa.carbonbackfill(attributes);
			}
			// this is the "no ads to serve" callback case
			else 
			{
				_bsa.callback(attributes);
			}
		}
	}
};

_bsa.testData = {
	ads: [
		{
			backgroundColor: 'red',
			backgroundHoverColor: '#ffffff',
			callToAction: 'Try now',
			company: 'Company Name',
			ctaBackgroundColor: '#0072c6',
			ctaBackgroundHoverColor: '#0089ee',
			description: 'We build widgets, and we think you should try them!',
			image: 'https://cdn4.buysellads.net/uu/1/18/1504373058-32397.png',
			logo: 'https://cdn4.buysellads.net/uu/1/18/1504373139-azure-1.png',
			statlink: '//www.buysellads.com/',
			textColor: '#ffffff',
			textColorHover: '#ffffff',
			timestamp: '1508185654',
			title: 'The best widgets'
		}
	]
};_bsa.getCookie = function (name)
{
	var nameEQ = name + '=',
		ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ')
			c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0)
			return c.substring(nameEQ.length,c.length);
	}
	return null;
};
_bsa.setCookie = function (name, value, seconds)
{
	if (seconds) {
		var date = new Date();
		date.setTime( date.getTime() + seconds );
		var expires = '; expires=' + date.toGMTString();
	}
	else
		var expires = '';
	document.cookie = name + '=' + value + expires + '; path=/';
};
_bsa.removeCookie = function (name)
{
	this.setCookie(name, '', -1);
};

//
window['_bsa_serving_callback'] = function(banner, zone, freqcap) {
	var append = function(w, data, days) {
			var c = document.cookie,
				i = c.indexOf(w + '='),
				existing = i >= 0 ? c.substring(i + w.length + 1).split(';')[0] + ',' : '',
				d = new Date();
			d.setTime(days * 3600000 + d);
			data = existing + data;
			data = data.substring(0, 2048);
			document.cookie = w + '=' + data + '; expires=' + d.toGMTString() + '; path=\/';
		};

	if (freqcap) {
		append('_bsap_daycap', banner, 1);
		append('_bsap_lifecap', banner, 365);
	}
};_bsa.default = function (zoneKey, segment, options, ads) {

	var disable_css = _bsa.isset(options) && _bsa.isset(options.disable_css) ? options.disable_css : false;
	var custom_domain = _bsa.isset(options) && _bsa.isset(options.custom_domain) ? options.custom_domain : false;
	var image_type = _bsa.isset(options) && _bsa.isset(options.image) ? options.image : false;

	_bsa.default.attributes = {
		"type": "default",
		"key": zoneKey,
		"segment": segment,
		"options": options,
		"ads": ads
	};

	_bsa.default.elID = function (options) {
		return (options && options.id) ? options.id : '_default_';
	};
	_bsa.default.align = function (options) {
		return (options && options.align) ? options.align : 'vertical';
	};

	function css(colors) {

		var c = '<style type="text/css">',
			id = _bsa.default.elID(options);

		if(_bsa.default.align(options) == 'vertical')
			c += '#'+id+'{flex-direction:column}#'+id+' ._default_{margin-bottom:10px;}';
		else
			c += '#'+id+'{flex-direction:row}#'+id+' a._default_{width:49%;}';

		c += '#'+id+'{position:relative;display:flex}#'+id+' a._default_{position:relative;display:flex;margin:5px;text-decoration:none}#'+id+' a._default_:hover .default-title{text-decoration:underline}#'+id+' .default-ad{position:absolute;top:0;right:0;padding:2px 3px;border-radius:2px;background:#e1e1e1;color:#9a9a9a;font-weight:600;font-size:12.5px}#'+id+' a._default_ .default-image{line-height:0;margin-right:10px}#'+id+' .default-image img{float:left;height:40px;border-radius:4px;padding:10px;margin:0}#'+id+' .default-text{line-height:1.35}#'+id+' .default-title{display:block;margin:4px 0 0 0;padding:0 0 4px;font-weight:600;font-size:16px}#'+id+' .default-description{display:block;margin-right:5%;color:#414141;font-size:14px}#'+id+' a:hover .default-description{color:#111}';

		c += '</style>';

		return c;

	}

	function template (ads) {

		var c = '<span class="default-ad">' + (_bsa.isset(options) && _bsa.isset(options.default_text) ? options.default_text : 'ad') + '</span>';

		for(var i=0; i < ads.length; i++)
		{
			c += '<a href="' + _bsa.link(ads[i].statlink, segment, custom_domain, ads[i].timestamp) + '" target="_blank" rel="noopener sponsored" class="_default_"><span class="default-image"><img src="' + ( _bsa.isset(ads[i].base64) ? ads[i].base64 : ( image_type == 'logo' ? ads[i].logo : ( _bsa.isset(ads[i].image) ? ads[i].image : ads[i].logo ) ) ) + '" style="background: '+ads[i].backgroundColor+';"/></span><div class="default-text"><span class="default-title">' + _bsa.htmlEncode(ads[i].company) + '</span><span class="default-description">' + _bsa.htmlEncode(ads[i].description) + '</span></div></a>';

			c += _bsa.pixel(ads[i].pixel, ads[i].timestamp);
		}

		return c;

	}

	if(ads) {
		_bsa.drop((disable_css ? '' : css(ads)) + template(ads), options.target, 'div', _bsa.default.elID(options), _bsa.default.attributes);
		_bsa.clearQueue(_bsa.findInQueue(zoneKey));
	}

	_bsa.callback(_bsa.default.attributes);

};
_bsa.default.readyToInit = true;
_bsa.defaultcta = function (zoneKey, segment, options, ads) {
	
	var disable_css = _bsa.isset(options) && _bsa.isset(options.disable_css) ? options.disable_css : false;
	var custom_domain = _bsa.isset(options) && _bsa.isset(options.custom_domain) ? options.custom_domain : false;
	var image_type = _bsa.isset(options) && _bsa.isset(options.image) ? options.image : false;
	
	_bsa.defaultcta.attributes = {
		"type": "default",
		"key": zoneKey,
		"segment": segment,
		"options": options,
		"ads": ads
	};
	
	_bsa.defaultcta.elID = function (options) {
		return (options && options.id) ? options.id : '_defaultcta_';
	};
	_bsa.defaultcta.align = function (options) {
		return (options && options.align) ? options.align : 'vertical';
	};
	
	function css(colors) {
		
		var c = '<style type="text/css">',
			id = _bsa.defaultcta.elID(options);
		
		if(_bsa.defaultcta.align(options) == 'vertical')
			c += '#'+id+'{flex-direction:column}#'+id+' ._default_{margin-bottom:10px;}';
		else
			c += '#'+id+'{flex-direction:row}#'+id+' a._default_{width:49%;}';
			
		c += '#'+id+'{position:relative;display:flex;box-shadow:0 0 10px #ccc;margin:0 0 40px;}#'+id+' a._defaultcta_{display:block;position:relative;text-decoration:none;padding:20px 20px 15px;}#'+id+' a._defaultcta_:nth-child(n+2){border-top:1px solid #f1f1f1;}#'+id+' a._default_ .default-title:hover{text-decoration:underline;}#'+id+' .default-ad{background:'+(_bsa.isset(options) && _bsa.isset(options.heading_background) ? options.heading_background : '#000000')+';color:'+(_bsa.isset(options) && _bsa.isset(options.heading_text) ? options.heading_text : '#000000')+';padding:10px;font-size:12.5px;font-weight:600;}#'+id+' a._defaultcta_ .default-image img{float:left;margin:0 20px 15px 0;height:60px;width:60px;}#'+id+' a._defaultcta_ .default-title{display:block;margin:4px 0 0 0;font-size:16px;font-weight:600;padding:0 0 4px;}#'+id+' a._defaultcta_ .default-description{display:block;font-size:14px;color:#414141;margin-right:5%;}#'+id+' a._defaultcta_ .default-cta{float:right;display:block;width:150px;padding:10px 10px;margin:10px 0 0 30px;border-radius:2px;text-align:center;background:'+(_bsa.isset(options) && _bsa.isset(options.cta_background) ? options.cta_background : '#000000')+';color:'+(_bsa.isset(options) && _bsa.isset(options.cta_text) ? options.cta_text : '#000000')+';}#'+id+' a[href^="//srv.buysellads.com/"]{display:block !important;}';
		
		c += '</style>';
		
		return c;
		
	}
	
	function template (ads) {
	
		var c = '<span class="default-ad">' + (_bsa.isset(options) && _bsa.isset(options.default_text) ? options.default_text : 'ad') + '</span>';

		for(var i=0; i < ads.length; i++)
		{
			c += '<a href="' + _bsa.link(ads[i].statlink, segment, custom_domain, ads[i].timestamp) + '" target="_blank" rel="nofollow noopener" class="_defaultcta_"><span class="default-image"><img src="' + ( _bsa.isset(ads[i].base64) ? ads[i].base64 : ( image_type == 'logo' ? ads[i].logo : ads[i].image ) ) + '" /></span><span class="default-cta">' + _bsa.htmlEncode(ads[i].callToAction) + '</span><span class="default-title">' + _bsa.htmlEncode(ads[i].company) + '</span><span class="default-description">' + _bsa.htmlEncode(ads[i].description) + '</span></a>';
			
			c += _bsa.pixel(ads[i].pixel, ads[i].timestamp);
		}
		
		return c;
		
	}
		
	if(ads) {
		_bsa.drop((disable_css ? '' : css(ads)) + template(ads), options.target, 'div', _bsa.defaultcta.elID(options), _bsa.defaultcta.attributes);
		_bsa.clearQueue(_bsa.findInQueue(zoneKey));
	}
	
	_bsa.callback(_bsa.defaultcta.attributes);
	
};
_bsa.defaultcta.readyToInit = true;_bsa.fancybar = function (zoneKey, segment, options, ads) {

	var disable_css = _bsa.isset(options) && _bsa.isset(options.disable_css) ? options.disable_css : false;
	var custom_domain = _bsa.isset(options) && _bsa.isset(options.custom_domain) ? options.custom_domain : false;

	_bsa.fancybar.attributes = {
		"type": "fancybar",
		"key": zoneKey,
		"segment": segment,
		"options": options,
		"ads": ads
	};

	// temp
	function temp_zonekey (segment) {

		var reroute = new Array();

			//cryptobar
			reroute['placement:coingecko'] = 'CKYDKKQE';
			reroute['placement:bitcoincom'] = 'CKYDKKQJ';
			reroute['placement:worldcoinindex'] = 'CKYDKKQL';
			reroute['placement:bitinfocharts'] = 'CKYDKKQI';
			reroute['placement:newsbtc'] = 'CKYDKKQW';
			reroute['placement:bitcoinforecast'] = 'CKYDKKQM';
			reroute['placement:coinmarketcal'] = 'CKYDKKQN';
			reroute['placement:advfn'] = 'CKYDKKQU';
			reroute['placement:coincodex'] = 'CKYDKKQY';
			reroute['placement:thebitcoinpub'] = 'CKYDKKQ7';
			reroute['placement:cryptoid'] = 'CKYDKKJE';
			reroute['placement:99bitcoins'] = 'CKYDKKJJ';
			reroute['placement:cryptocoinsnews'] = 'CKYDKKJL';
			reroute['placement:weekinethereum'] = 'CKYDKKJI';
			reroute['placement:flippeningwatch'] = 'CKYDKKJW';
			reroute['placement:bitinfocharts'] = 'CKYDKKQI';

			//fbn
			reroute['placement:geeksforgeeks'] = 'CKYDL2JJ';
			reroute['placement:pastebin'] = 'CKYDL2JL';
			reroute['placement:danstools'] = 'CKYDL27W';
			reroute['placement:programiz'] = 'CKYDL27L';
			reroute['placement:seeklogo'] = 'CKYDL27J';
			reroute['placement:howtoforge'] = 'CKYDL27E';
			reroute['placement:unixdotcom'] = 'CKYDL2J7';
			reroute['placement:speckyboy'] = 'CKYDL2JY';
			reroute['placement:jsonlint'] = 'CKYDL2JU';
			reroute['placement:w3layouts'] = 'CKYDL2JN';
			reroute['placement:graphicdesignjunction'] = 'CKYDL53E';
			reroute['placement:htmlcom'] = 'CKYDL2JW';
			reroute['placement:freevector'] = 'CKYDL2JI';
			reroute['placement:java2novice'] = 'CKYDL277';
			reroute['placement:coursetro'] = 'CKYDL27Y';
			reroute['placement:1stwebdesigner'] = 'CKYDL27U';
			reroute['placement:tinypaste'] = 'CKYDL53J';
			reroute['placement:entityframeworktutorial'] = 'CKYDL27N';
			reroute['placement:vandelaydesign'] = 'CKYDL27M';
			reroute['placement:photoshoptutorials'] = 'CKYDL2JM';
			reroute['placement:noobslab'] = 'CKYDL5QM';
			reroute['placement:osboxes'] = 'CKYDL5QW';
			reroute['placement:texblogorg'] = 'CKYDL5QI';
			reroute['placement:vector4free'] = 'CKYDL5QJ';
			reroute['placement:onlygfx'] = 'CKYDL5QE';
			reroute['placement:developerdrive'] = 'CKYDL537';
			reroute['placement:weandthecolor'] = 'CKYDL53Y';
			reroute['placement:html5doctor'] = 'CKYDL53U';
			reroute['placement:vectips'] = 'CKYDL53N';
			reroute['placement:pydev'] = 'CKYDL53M';
			reroute['placement:icons8com'] = 'CKYITKQ7';
			reroute['placement:networktools'] = 'CKYDL53I';
			reroute['placement:carlcheo'] = 'CKYDL53L';
			reroute['placement:faqforge'] = 'CKYITKQY';
			reroute['placement:digitalcom'] = 'CKYITKQU';
			reroute['placement:designerdaily'] = 'CKYITKQM';
			reroute['placement:creativenerds'] = 'CKYITKJE';
			reroute['placement:inserthtml'] = 'CKYITKQW';
			reroute['placement:go4expert'] = 'CKYITKQI';
			reroute['placement:sanwebe'] = 'CKYITKQL';
			reroute['placement:java4s'] = 'CKYITKQJ';
			reroute['placement:spyrestudios'] = 'CKYITKQE';
			reroute['placement:randomkeygen'] = 'CKYITK37';
			reroute['placement:freewebtemplates'] = 'CKYITK3Y';
			reroute['placement:photoshoplady'] = 'CKYITK3U';
			reroute['placement:dreamcss'] = 'CKYITK3N';
			reroute['placement:mygrafico'] = 'CKYITK3M';
			reroute['placement:fromdev'] = 'CKYITK3W';
			reroute['placement:queness'] = 'CKYITK3I';
			reroute['placement:w3bin'] = 'CKYITK3L';
			reroute['placement:psddd'] = 'CKYITK3J';
			reroute['placement:webappers'] = 'CKYITK3E';
			reroute['placement:icondeposit'] = 'CKYDL5Q7';
			reroute['placement:cssplay'] = 'CKYDL5QY';
			reroute['placement:snapmunk'] = 'CKYDL5QU';
			reroute['placement:vecto2000'] = 'CKYDL5QN';
			reroute['placement:cssmania'] = 'CKYDL53W';
			reroute['placement:ctrlq'] = 'CKYITKJJ';

		if(_bsa.isset(reroute[segment]))
			return reroute[segment];

		return zoneKey;
	};

	var show_ads_via = false,
		cryptobar = ['CKYIT2QE','CKYDL23E','CKYDKKQW','CKYIT2JI','CKYDKKQ7','CKYI4K3L','CKYDLK7Y','CKYDKKJI','CKYIT5QL','CKYDKKQL','CKYIT23L','CKYDKKJJ','CKYIT2JN','CKYIT2JU','CKYI427J','CKYDKKQJ','CKYDKKQM','CKYITK7W','CKYDKKQI','CKYI427E','CKYIT237','CKYDL23J','CKYDKKJE','CKYITK7N','CKYDKKQY','CKYDKKQE','CKYDKKQN','CKYDLK77','CKYITK7M','CKYIT537','CKYDKKJL','CK7D4K37','CKYDKKJW','CKYIT5QE','CKYDEKQL','CKYD55QY','CK7DPKJU'];

	if(cryptobar.indexOf(zoneKey) > 0)
		show_ads_via = true;

	if(zoneKey == 'CKYDV2QM' || zoneKey == 'C6ADVKE')
		zoneKey = temp_zonekey(segment);

	_bsa.fancybar.elID = function (options) {
		return (options && options.id) ? options.id : '_fbn_';
	};

	function css(colors, show_ads_via) {

		var c = colors[0],
			o = '',
			backgroundColor = _bsa.isset(c) && _bsa.isHex(c.barcolor) ? c.barcolor : ( _bsa.isset(c.backgroundColor) ? c.backgroundColor : _bsa.testData.ads[0].backgroundColor ),
			backgroundHoverColor = _bsa.isset(c) && _bsa.isHex(c.barcolorHover) ? c.barcolorHover : ( _bsa.isset(c.backgroundHoverColor) ? c.backgroundHoverColor : ( _bsa.isset(c.backgroundHoverColor) ? c.backgroundHoverColor : _bsa.testData.ads[0].backgroundHoverColor ) ),
			// TODO
			callToActionTextColor = _bsa.isset(c) && _bsa.isHex(c.callToActionTextColor) ? c.callToActionTextColor : ( _bsa.isset(c.ctaTextColor) ? c.ctaTextColor : _bsa.testData.ads[0].callToActionTextColor ),
			callToActionTextColorHover = _bsa.isset(c) && _bsa.isHex(c.callToActionTextColorHover) ? c.callToActionTextColorHover : ( _bsa.isset(c.ctaTextColorHover) ? c.ctaTextColorHover : _bsa.testData.ads[0].callToActionTextColorHover ),
			//
			ctaBackgroundColor = _bsa.isset(c) && _bsa.isHex(c.callToActionColor) ? c.callToActionColor : ( _bsa.isset(c.callToActionBackgroundColor) ? c.callToActionBackgroundColor : ( _bsa.isset(c.ctaBackgroundColor) ? c.ctaBackgroundColor : _bsa.testData.ads[0].ctaBackgroundColor ) ),
			ctaBackgroundHoverColor = _bsa.isset(c) && _bsa.isHex(c.callToActionColorHover) ? c.callToActionColorHover : ( _bsa.isset(c.ctaBackgroundHoverColor) ? c.ctaBackgroundHoverColor : _bsa.testData.ads[0].ctaBackgroundHoverColor ),
			textColor = _bsa.isset(c) && _bsa.isHex(c.textcolor) ? c.textcolor : ( _bsa.isset(c.textColor) ? c.textColor : _bsa.testData.ads[0].textColor ),
			textColorHover = _bsa.isset(c) && _bsa.isHex(c.textcolorHover) ? c.textcolorHover : ( _bsa.isset(c.textColorHover) ? c.textColorHover : _bsa.testData.ads[0].textColorHover ),
			id = _bsa.fancybar.elID(options);
		return '<style>#'+ id +'._bsa_hide ._bsa_fancybar{top:-100%}#'+ id +'._bsa_show ._bsa_fancybar{top:0}#'+ id +' ._bsa_fancybar{position:fixed;top:-80px;right:0;left:0;z-index:100001;margin:0 auto;background-color:' + backgroundColor + ';box-shadow:0 1px 10px hsla(0,0%,0%,.25);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",Helvetica,Arial,sans-serif;-webkit-transition:top 500ms ease-in-out;-moz-transition:top 500ms ease-in-out;-o-transition:top 500ms ease-in-out;transition:top 500ms ease-in-out;backface-visibility:hidden}#'+ id +' .fancybar-wrap{display:flex;box-sizing:border-box;padding:14px 20px;text-align:left;text-decoration:none;justify-content:space-between}#'+ id +' a:hover{background:' + backgroundHoverColor + '}#'+ id +' .fancybar-left{display:flex;align-items:center}#'+ id +' .fancybar-right{display:flex;align-items:center}#'+ id +' a .fancybar-cta{box-sizing:border-box;padding:8px 12px;border-radius:4px;background-color:' + ctaBackgroundColor + ';color:' + callToActionTextColor + ';text-transform:uppercase;white-space:nowrap;letter-spacing:1px;line-height:1;font-weight:600;font-size:12px}._bsa_fancybar a:hover .fancybar-cta{background:' + ctaBackgroundHoverColor + ';color:' + callToActionTextColorHover + '}#'+ id +' .fancybar-logo{line-height:0}#'+ id +' .fancybar-logo img{margin-right:20px;width:100px}#'+ id +' a .fancybar-text{display:flex;flex-direction:column;margin-right:20px;color:' + textColor + ';font-size:16px;line-height:1.5}#'+ id +' a:hover .fancybar-text{color:' + textColorHover + '}#'+ id +' .fancybar-disclaimer{font-style:italic;font-size:12px;color:' + textColor + 'cc;letter-spacing:.5px;line-height:1.5}#'+ id +' .fancybar-footer{position:absolute;right:20px;bottom:4px;border-top:0;border-top-left-radius:3px;color:' + textColor + ';text-decoration:none;text-transform:uppercase;letter-spacing:1px;line-height:1;font-weight:600;font-size:8px}#'+ id +' .fancybar-close{color:' + textColor + 'cc;cursor:pointer}#'+ id +' .fancybar-close:hover{color:' + textColor + '}#'+ id +' .fancybar-via{color:' + textColor + 'cc;font-size:8px;text-decoration:none}#'+ id +' .fancybar-via:hover{color:' + textColor + '}@media only screen and (min-width:480px) and (max-width:759px){#'+ id +' a .fancybar-text{font-size:14px;margin-right:0}#'+ id +' .fancybar-right{display:none}#'+ id +' .fancybar-disclaimer{font-size:10px}}@media only screen and (min-width:320px) and (max-width:479px){#'+ id +' a .fancybar-text{font-size:12px;margin-right:0}#'+ id +' .fancybar-right{display:none}#'+ id +' .fancybar-logo img{margin-right:10px;width:80px}#'+ id +' .fancybar-disclaimer{font-size:10px}}</style>';

	}

	function template (ads) {

	var a = ads[0],
		adViaLink = _bsa.isset(a.ad_via_link) ? _bsa.htmlEncode(a.ad_via_link) : 'https://buysellads.com/',
		callToAction = _bsa.isset(a.calltoaction) ? a.calltoaction : _bsa.isset(a.callToAction) ? a.callToAction : a.cta,
		company = _bsa.isset(a.heading) ? a.heading : a.company,
		description = _bsa.isset(a.text) ? a.text : a.description,
		image = _bsa.isset(a.base64) ? a.base64 : _bsa.isset(a.image) ? a.image : a.logo,
		logo = _bsa.isset(a.base64) ? a.base64 : _bsa.isset(a.logo) ? a.logo : a.image,
		statlink = _bsa.link(a.statlink, segment, custom_domain, a.timestamp),
		timestamp = a.timestamp,
		pixel = a.pixel,
		title = _bsa.isset(a.title) ? a.title : '',
		c = '';

	c += '<div class="_bsa_fancybar">' +
		'<a href="' + statlink + '" class="fancybar-wrap" target="_blank" rel="noopener sponsored">' +
		'<span class="fancybar-left"><span class="fancybar-logo"><img src="' + logo + '" /></span>' +
		'<span class="fancybar-text">' +
		'<span class="fancybar-desc">' + _bsa.htmlEncode(description) + '</span>';

	// horrible hacky cryptobar styles
	if (show_ads_via && title.length > 30)
		c += '<span class="fancybar-disclaimer" title="' + _bsa.htmlEncode(title) + '">' + _bsa.htmlEncode(title) + '</span>';

	c += '</span></span></span>' +
		'<span class="fancybar-right"><span class="fancybar-cta">' + _bsa.htmlEncode(callToAction) + '</span></span></a>';

	c +=
		'<div class="fancybar-footer"><span class="fancybar-close" onclick="_bsa.close(\'' + _bsa.fancybar.elID(options) + '\')">Hide Ad</span> &bull; <a class="fancybar-via" href="' + adViaLink + '">Ad via BuySellAds</a></div>';

		c += _bsa.pixel(pixel, timestamp);

		c += '</div>';

		return c;
	}

	//
	if(!_bsa.getCookie(_bsa.fancybar.elID(options)))
	{
		var _fancybar_didScroll;
		var _fancybar_didDrop = false;
		window.onscroll = function () {
		    _fancybar_didScroll = true
		};
		var _fancybar_scrollInterval = setInterval(function () {
		    if (_fancybar_didScroll && !_bsa.getCookie(_bsa.fancybar.elID(options))) {
		        _fancybar_didScroll = false;
		        var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
		        if (scrollTop >= 100 && !document.getElementById(options.script_id)) {
		        	_bsa.fancybar.readyToInit = true;
		            _bsa.init('fancybar', zoneKey, segment, options);
		        } else if (scrollTop >= 100) {
		            _bsa.show(_bsa.fancybar.elID(options))
		        }
		        if (scrollTop < 100) {
		            _bsa.hide(_bsa.fancybar.elID(options))
		        }
		    }
		}, 500);
	}

	if(ads) {
		_bsa.drop((disable_css ? '' : css(ads, show_ads_via)) + template(ads), 'body', 'div', _bsa.fancybar.elID(options), _bsa.fancybar.attributes);
		_bsa.clearQueue(_bsa.findInQueue(zoneKey));
	}

	_bsa.callback(_bsa.fancybar.attributes);

};
_bsa.fancybar.readyToInit = false;
_bsa.flexbar = function (zoneKey, segment, options, ads) {

	var disable_css = _bsa.isset(options) && _bsa.isset(options.disable_css) ? options.disable_css : false;
	var custom_domain = _bsa.isset(options) && _bsa.isset(options.custom_domain) ? options.custom_domain : false;

	_bsa.flexbar.elID = function (options) {
		return (options && options.id) ? options.id : '_flexbar_';
	};

	_bsa.flexbar.attributes = {
		"type": "flexbar",
		"key": zoneKey,
		"segment": segment,
		"options": options,
		"ads": ads
	};

	function css(colors) {

		var c = colors[0],
			backgroundColor = _bsa.isset(c) && _bsa.isHex(c.barcolor) ? c.barcolor : ( _bsa.isset(c.backgroundColor) ? c.backgroundColor : _bsa.testData.ads[0].backgroundColor ),
			backgroundHoverColor = _bsa.isset(c) && _bsa.isHex(c.barcolorHover) ? c.barcolorHover : ( _bsa.isset(c.backgroundHoverColor) ? c.backgroundHoverColor : ( _bsa.isset(c.backgroundHoverColor) ? c.backgroundHoverColor : _bsa.testData.ads[0].backgroundHoverColor ) ),

			// TODO
			callToActionTextColor = _bsa.isset(c) && _bsa.isHex(c.callToActionTextColor) ? c.callToActionTextColor : ( _bsa.isset(c.ctaTextColor) ? c.ctaTextColor : _bsa.testData.ads[0].callToActionTextColor ),
			callToActionTextColorHover = _bsa.isset(c) && _bsa.isHex(c.callToActionTextColorHover) ? c.callToActionTextColorHover : ( _bsa.isset(c.ctaTextColorHover) ? c.ctaTextColorHover : _bsa.testData.ads[0].callToActionTextColorHover ),
			//

			ctaBackgroundColor = _bsa.isset(c) && _bsa.isHex(c.callToActionColor) ? c.callToActionColor : ( _bsa.isset(c.callToActionBackgroundColor) ? c.callToActionBackgroundColor : ( _bsa.isset(c.ctaBackgroundColor) ? c.ctaBackgroundColor : _bsa.testData.ads[0].ctaBackgroundColor ) ),
			ctaBackgroundHoverColor = _bsa.isset(c) && _bsa.isHex(c.callToActionColorHover) ? c.callToActionColorHover : ( _bsa.isset(c.ctaBackgroundHoverColor) ? c.ctaBackgroundHoverColor : _bsa.testData.ads[0].ctaBackgroundHoverColor ),
			textColor = _bsa.isset(c) && _bsa.isHex(c.textcolor) ? c.textcolor : ( _bsa.isset(c.textColor) ? c.textColor : _bsa.testData.ads[0].textColor ),
			textColorHover = _bsa.isset(c) && _bsa.isHex(c.textcolorHover) ? c.textcolorHover : _bsa.testData.ads[0].textColorHover,
			id = _bsa.flexbar.elID(options);

		return '<style>#'+id+'._bsa_hide ._bsa_flexbar{display:none}#'+id+'._bsa_show ._bsa_flexbar{display:block}#'+id+'{display:block}#'+id+'._bsa_hide{margin-bottom:0}#'+id+' ._bsa_flexbar{position:relative;z-index:999999;width:100%;background:' + backgroundColor + ';text-align:left;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",Helvetica,Arial,sans-serif !important;-webkit-animation:fadein 2s;-moz-animation:fadein 2s;-ms-animation:fadein 2s;-o-animation:fadein 2s;animation:fadein 2s}#'+id+' ._bsa_flexbar:hover{background:' + backgroundHoverColor + '}#'+id+' .flexbar-wrap{display:flex;padding:18px 40px;text-decoration:none;align-items:center;justify-content:space-between}#'+id+' .flexbar-left{display:flex;align-items:center;justify-content:flex-start}#'+id+' .flexbar-text{display:flex;flex-direction:column;margin-right:60px}#'+id+' .flexbar-heading{color:' + textColor + ';text-transform:uppercase;letter-spacing:1px;font-weight:600;font-size:10px}#'+id+' .flexbar-sponsor{letter-spacing:1px;font-weight:400;opacity:.8}#'+id+' .flexbar-desc{color:' + textColor + ';letter-spacing:1px;font-size:16px;font-weight:400;line-height:1.3}#'+id+' .flexbar-logo{line-height:0}#'+id+' .flexbar-logo img{margin:0 30px 0 0;max-width:125px}#'+id+' .flexbar-cta{padding:10px 14px;border:0;border-radius:3px;background:' + ctaBackgroundColor + ';color:' + callToActionTextColor + ';text-decoration:none;text-transform:uppercase;white-space:nowrap;letter-spacing:.5px;font-weight:600;font-size:14px;line-height:1}#'+id+' .flexbar-footer{position:absolute;right:40px;bottom:4px;border-top:0;line-height:1;border-top-left-radius:3px;color:' + textColor + ';text-decoration:none;text-transform:uppercase;letter-spacing:1px;font-weight:600;font-size:8px}#'+id+' .flexbar-close{color:' + textColor + 'cc;cursor:pointer}#'+id+' .flexbar-close:hover{color:' + textColor + '}#'+id+' .flexbar-via{color:' + textColor + 'cc !important;text-decoration:none !important}#'+id+' .flexbar-via:hover{color:' + textColor + ' !important}@media all and (max-width:768px){#'+id+' .flexbar-logo img{max-width:100px}#'+id+' .flexbar-heading{font-size:9px;line-height:1.5;margin-bottom:2px}#'+id+' .flexbar-desc{font-size:14px}#'+id+' .flexbar-cta{font-size:12px}}@media all and (max-width:568px){#'+id+' .flexbar-logo img{display:none}#'+id+' .flexbar-cta{display:none}#'+id+' .flexbar-heading{font-size:8px}#'+id+' .flexbar-desc{font-size:12px}#'+id+' .flexbar-text{margin-right:0}#'+id+' .flexbar-footer{right:15px}#'+id+' .flexbar-wrap{padding:20px 15px}}</style>';

	}

	function template (ads) {

		var a = ads[0],
			adViaLink = _bsa.isset(a.ad_via_link) ? _bsa.htmlEncode(a.ad_via_link) : 'https://buysellads.com/',
			callToAction = ( _bsa.isset(a.calltoaction) ? a.calltoaction : ( _bsa.isset(a.callToAction) ? a.callToAction : a.cta ) ),
			company = _bsa.isset(a.heading) ? a.heading : a.company,
			description = _bsa.isset(a.text) ? a.text : a.description,
			image = _bsa.isset(a.base64) ? a.base64 : ( _bsa.isset(a.image) ? a.image : a.logo ),
			logo = _bsa.isset(a.base64) ? a.base64 : ( _bsa.isset(a.logo) ? a.logo : a.image ),
			statlink = _bsa.link(a.statlink, segment, custom_domain, a.timestamp),
			timestamp = a.timestamp,
			pixel = a.pixel,
			title = a.title,
			c = '';

		c +=
		'<div class="_bsa_flexbar"><a href="' +
		statlink +
		'" class="flexbar-wrap" target="_blank" rel="noopener sponsored"><span class="flexbar-left"><span class="flexbar-logo"><img src="' +
		logo +
		'" /></span><span class="flexbar-text"><span class="flexbar-heading"><span class="flexbar-sponsor">Sponsored by</span> ' +
		_bsa.htmlEncode(company) +
		'</span><span class="flexbar-desc">' +
		_bsa.htmlEncode(description) +
		'</span></span></span><span class="flexbar-cta">' +
		_bsa.htmlEncode(callToAction) +
		'</span></a><div class="flexbar-footer"><span class="flexbar-close" onclick="_bsa.close(\'' +
		_bsa.flexbar.elID(options) +
		'\')">Hide Ad</span> &bull; <a class="flexbar-via" href="' +
		adViaLink +
		'">Ad via BuySellAds</a></div>';

		c += _bsa.pixel(pixel, timestamp);

		c += '</div>';

		return c;

	}
	
	//
	if(!_bsa.getCookie(_bsa.flexbar.elID(options)))
	{
		var _flexbar_delay = setInterval( function () {
			if(!_bsa.getCookie(_bsa.flexbar.elID(options))) {
				if (!document.getElementById(options.script_id)) {
					_bsa.flexbar.readyToInit = true;
					_bsa.init('flexbar', zoneKey, segment, options);
					clearInterval(_flexbar_delay);
				}
			}
		 }, 100);
		 
		 if(ads) {
		 	_bsa.drop((disable_css ? '' : css(ads)) + template(ads), 'body', 'div', _bsa.flexbar.elID(options), _bsa.flexbar.attributes);
		 	_bsa.clearQueue(_bsa.findInQueue(zoneKey));
		 	clearInterval(_flexbar_delay);
		 }
		 _bsa.callback(_bsa.flexbar.attributes);
	}

};
_bsa.flexbar.readyToInit = false;
_bsa.recommended = function (zoneKey, segment, options, ads) {
	
	var custom_domain = _bsa.isset(options) && _bsa.isset(options.custom_domain) ? options.custom_domain : false,
		single = [],
		c = [];
	
	_bsa.recommended.attributes = {
		"type": "recommended",
		"key": zoneKey,
		"segment": segment,
		"options": options,
		"ads": ads
	};
	
	_bsa.recommended.elID = function (options) {
		return (options && options.id) ? options.id : '_recommended_';
	};
	
	// we need a template for this ad type
	if(!options.template)
		return false;
		
	if(ads) {
	
		// for these ads we have to do the drop a bit differently
		// we have to drop each individual ad within its own
		// containing "drop" to allow for the seamless integration
		// alongside the other widgets that show recommendations
		
		for(var i=0; i < ads.length; i++)
		{
			single[i] = options.template,
			c[i] = '';
			
			c[i] += single[i]
				.replace(new RegExp('##link##', 'g'), _bsa.link(ads[i].statlink, segment, custom_domain, ads[i].timestamp))
				.replace(new RegExp('##title##', 'g'), _bsa.htmlEncode(ads[i].title))
				.replace(new RegExp('##smallImage##', 'g'), ads[i].smallImage)
				.replace(new RegExp('##company##', 'g'), _bsa.htmlEncode(ads[i].company));
			
			c[i] += _bsa.pixel(ads[i].pixel, ads[i].timestamp);
			
			// we bring the drop into the for loop
			_bsa.drop(c[i], '::clone::'+options.target, 'div', _bsa.recommended.elID(options)+i, _bsa.recommended.attributes);
			
			if(options.removeExtras)
			{
				var to_remove = document.querySelector(options.target + ':last-child');
				to_remove.parentNode.removeChild(to_remove);
			}
			
		}
		
		// now resume normal process
		_bsa.clearQueue(_bsa.findInQueue(zoneKey));
	}
	
	_bsa.callback(_bsa.recommended.attributes);
	
};
_bsa.recommended.readyToInit = true;_bsa.list = function (zoneKey, segment, options, ads) {

	var custom_domain = _bsa.isset(options) && _bsa.isset(options.custom_domain) ? options.custom_domain : false,
		single = [],
		c = [];

	_bsa.list.attributes = {
		"type": "list",
		"key": zoneKey,
		"segment": segment,
		"options": options,
		"ads": ads
	};

	_bsa.list.elID = function (options) {
		return (options && options.id) ? options.id : '_list_';
	};

	// we need a template for this ad type
	if(!options.template)
		return false;

	if(ads) {

		// for these ads we have to do the drop a bit differently
		// we have to drop each individual ad within its own
		// containing "drop" to allow for the seamless integration
		// alongside the other widgets that show recommendations

		for(var i=0; i < ads.length; i++)
		{
			single[i] = options.template,
			c[i] = '';

			c[i] += single[i]
				.replace(new RegExp('##link##', 'g'), _bsa.link(ads[i].statlink, segment, custom_domain, ads[i].timestamp))
				.replace(new RegExp('##smallImage##', 'g'), ads[i].smallImage)
				.replace(new RegExp('##image##', 'g'), ads[i].image)
				.replace(new RegExp('##logo##', 'g'), ads[i].logo)
				.replace(new RegExp('##transparentLogo##', 'g'), ads[i].transparentLogo)
				.replace(new RegExp('##backgroundColor##', 'g'), _bsa.htmlEncode(ads[i].backgroundColor))
				.replace(new RegExp('##backgroundHoverColor##', 'g'), _bsa.htmlEncode(ads[i].backgroundHoverColor))
				.replace(new RegExp('##ctaBackgroundColor##', 'g'), _bsa.htmlEncode(ads[i].ctaBackgroundColor))
				.replace(new RegExp('##ctaBackgroundHoverColor##', 'g'), _bsa.htmlEncode(ads[i].ctaBackgroundHoverColor))
				.replace(new RegExp('##ctaTextColor##', 'g'), _bsa.htmlEncode(ads[i].ctaTextColor))
				.replace(new RegExp('##ctaTextColorHover##', 'g'), _bsa.htmlEncode(ads[i].ctaTextColorHover))
				.replace(new RegExp('##textColor##', 'g'), _bsa.htmlEncode(ads[i].textColor))
				.replace(new RegExp('##textColorHover##', 'g'), _bsa.htmlEncode(ads[i].textColorHover))
				.replace(new RegExp('##timestamp##', 'g'), _bsa.htmlEncode(ads[i].timestamp))
				.replace(new RegExp('##callToAction##', 'g'), _bsa.htmlEncode(ads[i].callToAction))
				.replace(new RegExp('##description##', 'g'), _bsa.htmlEncode(ads[i].description))
				.replace(new RegExp('##tagline##', 'g'), _bsa.htmlEncode(ads[i].companyTagline))
				.replace(new RegExp('##company##', 'g'), _bsa.htmlEncode(ads[i].company))
				.replace(new RegExp('##title##', 'g'), _bsa.htmlEncode(ads[i].title))
				.replace(new RegExp('##adViaLink##', 'g'), _bsa.htmlEncode(ads[i].ad_via_link));

			c[i] += _bsa.pixel(ads[i].pixel, ads[i].timestamp);

			// we bring the drop into the for loop
			_bsa.drop(c[i], '::clone::'+options.target, 'div', _bsa.list.elID(options)+i, _bsa.list.attributes);

			if(options.removeExtras)
			{
				var to_remove = document.querySelector(options.target + ':last-child');
				to_remove.parentNode.removeChild(to_remove);
			}

		}

		// now resume normal process
		_bsa.clearQueue(_bsa.findInQueue(zoneKey));
	}

	_bsa.callback(_bsa.recommended.attributes);

};
_bsa.recommended.readyToInit = true;
_bsa.stickybox = function (zoneKey, segment, options, ads) {

	var disable_css = _bsa.isset(options) && _bsa.isset(options.disable_css) ? options.disable_css : false;
	var custom_domain = _bsa.isset(options) && _bsa.isset(options.custom_domain) ? options.custom_domain : false;

	_bsa.stickybox.elID = function (options) {
		return (options && options.id) ? options.id : '_stickybox_';
	};
	_bsa.stickybox.align = function (options) {
		return (options && options.align) ? options.align : 'vertical';
	};

	_bsa.stickybox.attributes = {
		"type": "stickybox",
		"key": zoneKey,
		"segment": segment,
		"options": options,
		"ads": ads
	};

	function css(colors) {

		var c = '<style type="text/css">',
			id = _bsa.stickybox.elID(options);

		if(_bsa.stickybox.align(options) == 'vertical')
			c += '#'+id+'{flex-direction:column}#'+id+' ._stickybox_{margin-bottom:10px;}';
		else
			c += '#'+id+'{flex-direction:row}#'+id+' a._stickybox_{width:49%;}';

		c += '#'+id+'{flex-direction:column}#'+id+' ._stickybox_{margin:0}#'+id+'._bsa_hide{display:none}#'+id+'._bsa_show{display:flex}#'+id+'{position:relative;position:fixed;right:20px;bottom:20px;z-index:999 !important;display:flex;max-width:360px;border:1px solid #eaeaea;border-radius:2px;background:rgba(255,255,255,.95);box-shadow:rgba(0,0,0,.10) 1px 1px 15px 0;-webkit-animation:fadein .85s;-moz-animation:fadein .85s;-ms-animation:fadein .85s;-o-animation:fadein .85s;animation:fadein .85s}#'+id+' a._stickybox_{position:relative;display:flex;padding:10px 20px 10px 10px;text-decoration:none}#'+id+' a._stickybox_:hover .stickybox-title{text-decoration:underline}#'+id+' .stickybox-ad{position:absolute;bottom:57px;left:-18px;display:block;padding:2px 0;width:18px;border-radius:2px 0 0 2px;background:rgba(0,0,0,.1);color:#6e6e6e;text-align:center;text-decoration:none;font-size:11px}#'+id+' .stickybox-ad:hover{background:rgba(0,0,0,.2)}#'+id+' a._stickybox_ .stickybox-image{margin-right:10px;padding:10px;display:table;border-radius:2px;line-height:0}#'+id+' a._stickybox_ .stickybox-image img{max-width:40px}#'+id+' a._stickybox_ .stickybox-title{display:block;line-height:1.5;font-weight:600;font-size:14px}#'+id+' a._stickybox_ .stickybox-description{display:block;max-width:350px;color:#414141;line-height:1.35;font-size:13px}#'+id+' a._stickybox_:hover .stickybox-description{color:#111}#'+id+' .stickybox-close{position:absolute;top:7px;right:7px;display:block;float:right;width:18px;height:18px;border-radius:50px;background:rgba(0,0,0,.1);color:#fff;text-align:center;text-decoration:none;font-weight:bold;font-size:12px;line-height:150%}#'+id+' .stickybox-close:hover{background:rgba(0,0,0,.3);color:rgba(255,255,255,.8);cursor:pointer}@keyframes "fadein"{from{opacity:0}to{opacity:1}}@-moz-keyframes "fadein"{from{opacity:0}to{opacity:1}}@-webkit-keyframes "fadein"{from{opacity:0}to{opacity:1}}@-ms-keyframes fadein{from{opacity:0}to{opacity:1}}@-o-keyframes fadein{from{opacity:0}to{opacity:1}}';

		c += '</style>';

		return c;

	}

	function template (ads) {

		var c = '<a href="'+ads[0].ad_via_link+'" rel="noopener sponsored" target="_blank" class="stickybox-ad">' + (_bsa.isset(options) && _bsa.isset(options.stickybox_text) ? options.stickybox_text : 'ad') + '</a>';

		// this format only accepts a single ad
		for(var i=0; i < 1; i++)
		{
			c += '<a href="' + _bsa.link(ads[i].statlink, segment, custom_domain, ads[i].timestamp) + '" target="_blank" rel="nofollow noopener" class="_stickybox_"><span class="stickybox-image" style="background-color:'+ads[i].backgroundColor+'";><img src="' + ( _bsa.isset(ads[i].base64) ? ads[i].base64 : ads[i].image ) + '" /></span><div class="stickybox-text"><span class="stickybox-title">' + _bsa.htmlEncode(ads[i].title) + '</span><span class="stickybox-description">' + _bsa.htmlEncode(ads[i].description) + '</span></div></a><span class="stickybox-close" onclick="_bsa.close(\'' + _bsa.stickybox.elID(options) + '\')">&#10005;</span>';

			c += _bsa.pixel(ads[i].pixel, ads[i].timestamp);
		}

		return c;

	}

	if(!_bsa.getCookie(_bsa.stickybox.elID(options)))
		if(ads) {
			_bsa.drop((disable_css ? '' : css(ads)) + template(ads), options.target, 'div', _bsa.stickybox.elID(options), _bsa.stickybox.attributes);
			_bsa.clearQueue(_bsa.findInQueue(zoneKey));
		}
	
	_bsa.callback(_bsa.stickybox.attributes);

};
_bsa.stickybox.readyToInit = true;
_bsa.custom = function (zoneKey, segment, options, ads) {

	var custom_domain = _bsa.isset(options) && _bsa.isset(options.custom_domain) ? options.custom_domain : false,
		single = [];

	_bsa.custom.attributes = {
		"type": "custom",
		"key": zoneKey,
		"segment": segment,
		"options": options,
		"ads": ads
	};

	_bsa.custom.elID = function (options) {
		return (options && options.id) ? options.id : '_custom_';
	};

	function template (ads) {

		var c = '';

		for(var i=0; i < ads.length; i++)
		{
			single[i] = options.template;

			// Iterate through object entries to generate dynamic placeholder name.
			var ad = Object.entries(ads[i]);
			for (const [key, value] of ad) 
			{
				if(`${key}` === 'statlink')
					single[i] = single[i].replace(new RegExp('##' + `${key}` + '##', 'g'), _bsa.link(ads[i][`${key}`], segment, custom_domain, ads[i].timestamp));
				else
					single[i] = single[i].replace(new RegExp('##' + `${key}` +'##', 'g'), _bsa.htmlEncode(`${value}`));
			}
			
			// Maintain support for placeholders that don't match the actual key names.

			single[i] = single[i]
				.replace(new RegExp('##link##', 'g'), _bsa.link(ads[i].statlink, segment, custom_domain, ads[i].timestamp))
				.replace(new RegExp('##adViaLink##', 'g'), _bsa.htmlEncode(ads[i].ad_via_link))
				.replace(new RegExp('##tagline##', 'g'), _bsa.htmlEncode(ads[i].companyTagline))
				.replace(new RegExp('##.*##', 'g'), '');


			c += single[i];
			c += _bsa.pixel(ads[i].pixel, ads[i].timestamp);
		}

		return c;

	}

	// we need a template for this ad type
	if(!options.template)
		return false;

	if(ads) {
		_bsa.drop(template(ads), options.target, 'div', _bsa.custom.elID(options), _bsa.custom.attributes);
		_bsa.clearQueue(_bsa.findInQueue(zoneKey));
	}

  _bsa.callback(_bsa.custom.attributes);

};
_bsa.custom.readyToInit = true;
_bsa.hovercard = function (zoneKey, segment, options, ads) {

	var disable_css = _bsa.isset(options) && _bsa.isset(options.disable_css) ? options.disable_css : false;
	var custom_domain = _bsa.isset(options) && _bsa.isset(options.custom_domain) ? options.custom_domain : false;
	var image_type = _bsa.isset(options) && _bsa.isset(options.image) ? options.image : false;

	_bsa.hovercard.attributes = {
		"type": "hovercard",
		"key": zoneKey,
		"segment": segment,
		"options": options,
		"ads": ads
	};

	_bsa.hovercard.elID = function (options) {
		return (options && options.id) ? options.id : '_hovercard_';
	};

	function css(colors) {

		var c = '<style type="text/css">',
			id = _bsa.hovercard.elID(options);

		c += '@-webkit-keyframes hover-swing{20%{-webkit-transform:rotate3d(0,0,1,10deg);transform:rotate3d(0,0,1,10deg)}40%{-webkit-transform:rotate3d(0,0,1,-7deg);transform:rotate3d(0,0,1,-7deg)}60%{-webkit-transform:rotate3d(0,0,1,5deg);transform:rotate3d(0,0,1,5deg)}80%{-webkit-transform:rotate3d(0,0,1,-5deg);transform:rotate3d(0,0,1,-5deg)}to{-webkit-transform:rotate3d(0,0,1,0);transform:rotate3d(0,0,1,0)}}@keyframes hover-swing{20%{-webkit-transform:rotate3d(0,0,1,10deg);transform:rotate3d(0,0,1,10deg)}40%{-webkit-transform:rotate3d(0,0,1,-7deg);transform:rotate3d(0,0,1,-7deg)}60%{-webkit-transform:rotate3d(0,0,1,5deg);transform:rotate3d(0,0,1,5deg)}80%{-webkit-transform:rotate3d(0,0,1,-5deg);transform:rotate3d(0,0,1,-5deg)}to{-webkit-transform:rotate3d(0,0,1,0);transform:rotate3d(0,0,1,0)}}#'+ id +'{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif}#'+ id +' .hover-section{position:relative;left:14px}#'+ id +' .hover-banner,#'+ id +' .hover-subset{position:relative;top:14px;left:-14px}#'+ id +' .hover-section{display:flex;flex-direction:column;max-width:250px;border-radius:8px;background-color:#201b2a;text-decoration:none}#'+ id +' .hover-banner:before{transition:all .2s ease-in-out}#'+ id +' .hover-banner:before{position:absolute;bottom:0;left:0;width:0;height:0;border-width:0;border-top-right-radius:0;background-color:hsla(0,0%,100%,0);content:""}#'+ id +' .hover-banner:hover{-webkit-transform-origin:top center;transform-origin:top center;-webkit-animation-name:hover-swing;animation-name:hover-swing;-webkit-animation-duration:1s;animation-duration:1s;-webkit-animation-fill-mode:both;animation-fill-mode:both}#'+ id +' .hover-banner:hover:before{width:100%;height:100%;border-width:60px;border-top-right-radius:100%;background-color:hsla(0,0%,100%,.08)}#'+ id +' .hover-ad{position:absolute;top:0;right:0;padding:3px 8px;border-top-right-radius:8px;border-bottom-left-radius:8px;text-transform:uppercase;font-weight:600;font-size:9px}#'+ id +' .hover-banner{display:flex;margin-bottom:14px;height:140px;border-radius:8px;box-shadow:inset 0 0 0 1px hsla(0,0%,0%,.1);justify-content:center;align-items:center}#'+ id +' .hover-logo{width:125px;height:50px}#'+ id +' .hover-subset{display:flex}#'+ id +' .hover-icon{box-sizing:content-box;margin-right:10px;padding:4px;height:20px;border:solid 5px #201b2a;border-radius:50%}#'+ id +' .hover-description{margin-bottom:30px;color:#ddd;font-size:14px;line-height:1.4;text-align:left}';

		c += '</style>';

		return c;

	}

	function template (ads) {

		var c = '';

		for(var i=0; i < ads.length; i++)
		{
			ads[i].companyTagline = ads[i].companyTagline ? ads[i].companyTagline : ads[i].company;

			c += '<a href="' + ads[i].statlink + '" class="hover-section" target="_blank" rel="noopener sponsored">';
			c += '<div class="hover-banner" style="background-color: ' + ads[i].backgroundColor + '">';
			c += '<span style="color: ' + ads[i].backgroundColor + '; background-color: ' + ads[i].textColor + 'CC" class="hover-ad">Sponsored</span>';
			c += '<img class="hover-logo" src="' + ads[i].logo + '">';
			c += '</div>';
			c += '<div class="hover-subset">';
			c += '<img class="hover-icon" style="background-color: ' + ads[i].backgroundColor + '" src="' + ads[i].image + '">';
			c += '<div class="hover-description"><strong>' + ads[i].company + '</strong> ' + ads[i].description + '</div>';
			c += '</div>';
			c += '</a>';

			c += _bsa.pixel(ads[i].pixel, ads[i].timestamp);
		}

		return c;

	}

	if(ads) {
		_bsa.drop((disable_css ? '' : css(ads)) + template(ads), options.target, 'div', _bsa.hovercard.elID(options), _bsa.hovercard.attributes);
		_bsa.clearQueue(_bsa.findInQueue(zoneKey));
	}

	_bsa.callback(_bsa.hovercard.attributes);

};
_bsa.hovercard.readyToInit = true;
_bsa.iab = function (zoneKey, segment, options, ads) {

	var disable_css = _bsa.isset(options) && _bsa.isset(options.disable_css) ? options.disable_css : false;
	var custom_domain = _bsa.isset(options) && _bsa.isset(options.custom_domain) ? options.custom_domain : false;

	_bsa.iab.elID = function (options) {
		return (options && options.id) ? options.id : '_iab_';
	};

	_bsa.iab.iabformat = function (options) {
		return (options && options.iabformat) ? options.iabformat : 'leaderboard';
	};

	_bsa.iab.attributes = {
		"type": "iab",
		"key": zoneKey,
		"segment": segment,
		"options": options,
		"ads": ads
	};

	function css(colors) {

		var c = colors[0],
			backgroundColor = _bsa.isset(c) && _bsa.isHex(c.barcolor) ? c.barcolor : ( _bsa.isset(c.backgroundColor) ? c.backgroundColor : _bsa.testData.ads[0].backgroundColor ),
			backgroundHoverColor = _bsa.isset(c) && _bsa.isHex(c.barcolorHover) ? c.barcolorHover : ( _bsa.isset(c.backgroundHoverColor) ? c.backgroundHoverColor : ( _bsa.isset(c.backgroundHoverColor) ? c.backgroundHoverColor : _bsa.testData.ads[0].backgroundHoverColor ) ),

			// TODO
			callToActionTextColor = _bsa.isset(c) && _bsa.isHex(c.callToActionTextColor) ? c.callToActionTextColor : ( _bsa.isset(c.ctaTextColor) ? c.ctaTextColor : _bsa.testData.ads[0].callToActionTextColor ),
			callToActionTextColorHover = _bsa.isset(c) && _bsa.isHex(c.callToActionTextColorHover) ? c.callToActionTextColorHover : ( _bsa.isset(c.ctaTextColorHover) ? c.ctaTextColorHover : _bsa.testData.ads[0].callToActionTextColorHover ),
			//

			ctaBackgroundColor = _bsa.isset(c) && _bsa.isHex(c.callToActionColor) ? c.callToActionColor : ( _bsa.isset(c.callToActionBackgroundColor) ? c.callToActionBackgroundColor : ( _bsa.isset(c.ctaBackgroundColor) ? c.ctaBackgroundColor : _bsa.testData.ads[0].ctaBackgroundColor ) ),
			ctaBackgroundHoverColor = _bsa.isset(c) && _bsa.isHex(c.callToActionColorHover) ? c.callToActionColorHover : ( _bsa.isset(c.ctaBackgroundHoverColor) ? c.ctaBackgroundHoverColor : _bsa.testData.ads[0].ctaBackgroundHoverColor ),
			textColor = _bsa.isset(c) && _bsa.isHex(c.textcolor) ? c.textcolor : ( _bsa.isset(c.textColor) ? c.textColor : _bsa.testData.ads[0].textColor ),
			textColorHover = _bsa.isset(c) && _bsa.isHex(c.textcolorHover) ? c.textcolorHover : ( _bsa.isset(c.textColorHover) ? c.textColorHover : _bsa.testData.ads[0].textColorHover),
			id = _bsa.iab.elID(options);

		return '<style>#'+id+' .z_'+zoneKey+' ._bsa_iab{display:flex;padding:20px 20px;text-decoration:none;border:solid 1px #e4e6e8;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;flex-flow:row nowrap;justify-content:space-between;align-items:center;background:-ms-linear-gradient(-30deg,' + backgroundColor + ',' + backgroundColor + ' 45%,' + backgroundColor + ' 45%);background:-webkit-linear-gradient(-30deg,' + backgroundColor + ',' + backgroundColor + ' 45%,' + backgroundColor + ' 45%);background:linear-gradient(-30deg,' + backgroundColor + 'E5,' + backgroundColor + 'E5 45%,' + backgroundColor + ' 45%) #fff;box-sizing:border-box}#'+id+' .z_'+zoneKey+' ._bsa_iab.leaderboard{width:728px;height:90px}#'+id+' .z_'+zoneKey+' ._bsa_iab.rectangle{width:300px;height:250px}#'+id+' .z_'+zoneKey+' ._bsa_iab .iab-image{margin-right:20px;max-height:50px;border-radius:3px}#'+id+' .z_'+zoneKey+' ._bsa_iab.rectangle .iab-image{margin-bottom:10px}#'+id+' .z_'+zoneKey+' ._bsa_iab .iab-main{display:flex;flex-grow:1;flex-flow:row nowrap;align-items:center}#'+id+' .z_'+zoneKey+' ._bsa_iab.rectangle .iab-main{display:flex;flex-grow:1;flex-flow:wrap}#'+id+' .z_'+zoneKey+' ._bsa_iab .iab-details{display:block;margin-right:10px;color:' + textColor + ' !important;flex-flow:column nowrap}#'+id+' .z_'+zoneKey+' ._bsa_iab .iab-company{margin-bottom:4px;text-transform:uppercase;letter-spacing:2px;font-size:11px}#'+id+' .z_'+zoneKey+' ._bsa_iab.rectangle .iab-company.iab-first{display:none}#'+id+' .z_'+zoneKey+' ._bsa_iab.leaderboard .iab-company.iab-aux{display:none}#'+id+' .z_'+zoneKey+' ._bsa_iab.rectangle .iab-company.iab-aux{color:' + textColor + ' !important;margin-top:20px;opacity:.7}#'+id+' .z_'+zoneKey+' ._bsa_iab .iab-desc{letter-spacing:1px;font-weight:300;font-size:13px;line-height:1.4}#'+id+' .z_'+zoneKey+' ._bsa_iab.rectangle .iab-desc{font-size:15px}#'+id+' .z_'+zoneKey+' ._bsa_iab .iab-cta{padding:10px 14px;border-radius:3px;text-transform:uppercase;white-space:nowrap;letter-spacing:1px;font-weight:400;font-size:12px;transition:all .3s ease-in-out;color:' + callToActionTextColor + ';background-color:' + ctaBackgroundColor + ';margin-left:auto}#'+id+' .z_'+zoneKey+' ._bsa_iab.rectangle .iab-cta{margin-left:inherit;margin-top:15px}</style>';

	}

	function template (ads) {

		var c = '';

		// this format only accepts a single ad
		for(var i=0; i < 1; i++)
		{
			c += '<div class="z_'+zoneKey+'"><a href="' + _bsa.link(ads[i].statlink, segment, custom_domain, ads[i].timestamp, options.clicktag) + '" target="_blank" rel="noopener sopnsored" class="_bsa_iab ' + _bsa.iab.iabformat(options) + '"><span class="iab-main"><img class="iab-image" src="' + ( _bsa.iab.iabformat(options) == 'rectangle' ? ads[i].logo : ads[i].logo ) + '" /><span class="iab-details"><div class="iab-company iab-first">Sponsored by <strong>' + _bsa.htmlEncode(ads[i].company) + '</strong></div><div class="iab-desc">' + _bsa.htmlEncode(ads[i].description) + '</div></span><span class="iab-cta">' + _bsa.htmlEncode(ads[i].callToAction) + '</span><span class="iab-company iab-aux">Sponsored by <strong>' + _bsa.htmlEncode(ads[i].company) + '</strong></span></span></a></div>';

			c += _bsa.pixel(ads[i].pixel, ads[i].timestamp);
		}

		return c;

	}

	if(ads) {
		_bsa.drop((disable_css ? '' : css(ads)) + template(ads), options.target, 'div', _bsa.iab.elID(options), _bsa.iab.attributes);
		_bsa.clearQueue(_bsa.findInQueue(zoneKey));
	}

	_bsa.callback(_bsa.iab.attributes);

};
_bsa.iab.readyToInit = true;
_bsa.carbonbackfill = function (a) {

	var carbon = document.createElement('script');
		carbon.type = 'text/javascript';
		carbon.src = 'https://cdn.carbonads.com/carbon.js?serve=' + a.options.carbonfallback;
		carbon.id = '_carbonads_js';
	
	if(!_bsa.isset(a.options.disable_css) || a.options.disable_css == false) {
		var carbonstyle = document.createElement('style');
			carbonstyle.innerHTML = '#carbonads{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",Helvetica,Arial,sans-serif}#carbonads{position:relative;display:block;overflow:hidden;box-sizing:border-box;width:728px;height:90px;background-color:#fcfcfc;border:1px solid #cacaca}#carbonads>span{position:relative;display:block}#carbonads a{color:inherit;text-decoration:none}#carbonads a:hover{color:inherit}.carbon-wrap{display:flex;align-items:center}.carbon-img{display:block;margin:0;line-height:1}.carbon-img img{display:block;width:auto;height:90px}.carbon-text{position:relative;display:flex;margin-bottom:12px;padding:8px 1em;max-width:600px;text-align:left;font-size:18px;line-height:1.35;align-items:center}.carbon-text:after{display:table;margin-left:20px;padding:12px 16px;border-radius:3px;background-color:#333;color:#fff;content:"Learn More";white-space:nowrap;font-weight:600;font-size:14px;line-height:1}.carbon-poweredby{position:absolute;bottom:4px;left:134px;color:#999!important;text-transform:uppercase;white-space:nowrap;letter-spacing:.5px;font-weight:600;font-size:8px}';
		carbon.appendChild(carbonstyle);
	}
	
	document.getElementById(a.options.target.substring(1)).appendChild(carbon);
};