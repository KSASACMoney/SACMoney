/*
	Dimension by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/
var offset;

(function($) {

	skel.breakpoints({
		xlarge:		'(max-width: 1680px)',
		large:		'(max-width: 1280px)',
		medium:		'(max-width: 980px)',
		small:		'(max-width: 736px)',
		xsmall:		'(max-width: 480px)',
		xxsmall:	'(max-width: 360px)'
	});

	$(function() {

		var	$window = $(window),
			$body = $('body'),
			$wrapper = $('#wrapper'),
			$header = $('#header'),
			$footer = $('#footer'),
			$main = $('#main'),
			$main_articles = $main.children('article');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 100);
			});

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Fix: Flexbox min-height bug on IE.
			if (skel.vars.IEVersion < 12) {

				var flexboxFixTimeoutId;

				$window.on('resize.flexbox-fix', function() {

					clearTimeout(flexboxFixTimeoutId);

					flexboxFixTimeoutId = setTimeout(function() {

						if ($wrapper.prop('scrollHeight') > $window.height())
							$wrapper.css('height', 'auto');
						else
							$wrapper.css('height', '100vh');

					}, 250);

				}).triggerHandler('resize.flexbox-fix');

            }

            var sfAbled=false;
            function song_fest() {
                /* Song Festival */
                var SC = document.getElementById("SFestControl");

                var sfHttp = new XMLHttpRequest();	//sfList[0] = "Bet" or "Vote" , sfList[1] = "Betting" or "Round 1", ....
                sfHttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var res = this.responseText;
                        var sfList = res.split('\n');

                        var form = $("<form>", {
                            method: "POST",
                            action: "../songFes/" + sfList[0],
                            onsubmit: "document.getElementById('tempBet').value = RSA_encrypt_s($('input[name="+sfList[0]+"]:checked').val()+';'+(document.getElementById('BetMoney')||{value:0}).value);",
                            autocomplete: "off"
                        });
                        var title = $("<h3>", {
                            class: "major",
                            text: sfList[1]
                        });
                        title.appendTo(form);
                        var fieldset = $("<fieldset>", {});
                        fieldset.appendTo(form);

                        if(sfList[2]=="able"){
                            fieldset.attr("disabled",false);
                            sfAbled = true;
                        }else{
                            fieldset.attr("disabled",true);
                            sfAbled = false;
                        }

                        var fieldFirst = $("<div>", {
                            class: "field half first"
                        });
                        var fieldHalf = $("<div>", {
                            class: "field half"
                        });
                        fieldFirst.appendTo(fieldset);
                        fieldHalf.appendTo(fieldset);
                        for (var i = 3; i < sfList.length; i++) {
                            var input = $("<input>", {
                                type: "radio",
                                id: "T" + (i - 2),
                                value: "T" + (i - 2),
                                name: sfList[0]
                            });
                            var label = $("<label>", {
                                for: "T" + (i - 2),
                                text: sfList[i]
                            })
                            if (i % 2 == 1) {
                                input.appendTo(fieldFirst);
                                label.appendTo(fieldFirst);
                                if (i != sfList.length-1 && i != sfList.length-2) {
                                    $("<br/>", {}).appendTo(fieldFirst);
                                    $("<br/>", {}).appendTo(fieldFirst);
                                }
                            }
                            else {
                                input.appendTo(fieldHalf);
                                label.appendTo(fieldHalf);
                                if (i != sfList.length - 1 && i != sfList.length-2) {
                                    $("<br/>", {}).appendTo(fieldHalf);
                                    $("<br/>", {}).appendTo(fieldHalf);
                                }
                            }
                        }

                        if (sfList[0] == "Bet") {
                            var inputField = $("<div class=\"field\"><input type=\"tel\" name=\"BetMoney\" id=\"BetMoney\" value=\"\" placeholder=\"Money To Bet\" onpaste=\"return false;\" onkeypress=\"return event.charCode >= 48 && event.charCode <= 57;\"/></div>", {});
                            inputField.appendTo(fieldset);
                        }

                        var tempIF = $("<input style=\"display:none\" type=\"text\" name=\"tempBet\" id=\"tempBet\" value=\"\"/>");
                        tempIF.appendTo(fieldset);

                        var btnText = sfList[0];
                        if(sfList[2]=="disable"){
                            btnText = "Not Started Yet!";
                        }else if(sfList[2]=="already"){
                            btnText = "You already did!";
                        }
                        var btn = $("<ul class=\"actions\"><li><input type=\"submit\" class=\"special\" value=\"" + btnText + "\"/></li></ul>", {});
                        btn.appendTo(fieldset);

                        SC.innerHTML = "";
                        form.appendTo(SC);

                        console.log(1000 + sfAbled*59000, sfAbled);
                    }
                };
                sfHttp.open("GET", "../songFes/info", true);
                sfHttp.send();
            }

            var count=0;
            function song_fest_interval(){
                count+=1;
                if(count === (1 +sfAbled*59)){
                    song_fest();
                    count = 0;
                }
            }

            $(document).ready(

                function(){

                    $.get("http://ksasac2017.tk/account/time",
                        function(data, status){
                            offset = new Date().getTime()-data;
                        }
                    );

                    var L = window.location.pathname.split("/");
                    if(L[L.length-1].indexOf("main")!=-1){

                        //song_fest_interval();
                        //setInterval(song_fest_interval, 1000);


                        /* Schedule */
                        var EvTable = document.getElementById("EvTable");
                        var schHttp = new XMLHttpRequest();
                        schHttp.onreadystatechange = function () {
                            if (this.readyState == 4 && this.status == 200) {
                                var res = this.responseText;
                                var schList = res.split('\n');

                                for (var i = 0; i < schList.length-1; i++) {
                                    var schInfo = schList[i].split('\t');
                                    var tr = $("<tr>", {});
                                    var td1 = $("<td>", {});
                                    var td2 = $("<td>", {});
                                    var td3 = $("<td>", {});
                                    var spanTime = $("<span>", {
                                        text: schInfo[0] + "\t"
                                    });
                                    spanTime.appendTo(td1);
                                    var span_Title = $("<span>", {
                                        text: schInfo[1]
                                    });
                                    span_Title.appendTo(td2);
                                    var spanPlace = $("<span>", {
                                        text: schInfo[2]
                                    });
                                    spanPlace.appendTo(td3);
                                    td1.appendTo(tr);
                                    td2.appendTo(tr);
                                    td3.appendTo(tr);
                                    tr.appendTo(EvTable);
                                }
                            }
                        };
                        schHttp.open("GET", "../schedule/event", true);
                        schHttp.send();

                        var BthTable = document.getElementById("BthTable");
                        var bthHttp = new XMLHttpRequest();
                        bthHttp.onreadystatechange = function () {
                            if (this.readyState == 4 && this.status == 200) {
                                var res = this.responseText;
                                var bthList = res.split('\n');

                                for (var i = 0; i < bthList.length-1; i++) {
                                    var bthInfo = bthList[i].split('\t');
                                    var tr = $("<tr>", {});
                                    var td1 = $("<td>", {});
                                    var td2 = $("<td>", {});
                                    var td3 = $("<td>", {});
                                    var spanTime = $("<span>", {
                                        text: "\t"
                                    });
                                    spanTime.appendTo(td1);
                                    var span_Title = $("<span>", {
                                        text: bthInfo[0]
                                    });
                                    span_Title.appendTo(td2);
                                    var spanPlace = $("<span>", {
                                        text: bthInfo[1]
                                    });
                                    spanPlace.appendTo(td3);
                                    td1.appendTo(tr);
                                    td2.appendTo(tr);
                                    td3.appendTo(tr)
                                    tr.appendTo(BthTable);
                                }
                            }
                        };
                        bthHttp.open("GET", "../schedule/booth", true);
                        bthHttp.send();

                        /*Check in*/
                        var CTB = document.getElementById("checkInTbody");
                        var CTF = document.getElementById("checkInTfoot");

                        var chHttp = new XMLHttpRequest();
                        chHttp.onreadystatechange = function () {
                            if (this.readyState == 4 && this.status == 200) {
                                var res = this.responseText;
                                var chList = res.split('\n');

                                var resStr = "";
                                for (var i = 0; i < chList.length-1; i++) {
                                    resStr += "<tr><td>" + (i + 1) + "</td><td>" + chList[i] + "</td></tr>";
                                }
                                CTB.innerHTML = resStr;
                                CTF.innerHTML = "<tr><td></td><td>" + nextGet(chList.length-1) + "</td></tr>";
                            }
                        };
                        chHttp.open("GET", "../checkin/info", true);
                        chHttp.send();

                        var acc_ID = document.getElementById("acc_ID");
                        var acc_Name = document.getElementById("acc_Name");
                        var acc_Balance = document.getElementById("acc_Balance");

                        var accHttp = new XMLHttpRequest();
                        accHttp.onreadystatechange = function () {
                            if (this.readyState == 4 && this.status == 200) {
                                var res = this.responseText;
                                var accList = res.split('\n');

                                acc_ID.innerHTML = accList[0];
                                acc_Name.innerHTML = accList[1];
                                acc_Balance.innerHTML = accList[2] + " SAC";
                            }
                        };
                        accHttp.open("GET", "../account/info", true);
                        accHttp.send();

                        // for refresh data
                        setInterval(function () {

                            /*Auction*/
                            var IT = document.getElementById("image_thumb");
                            var PD = document.getElementById("prize_desc");
                            var FS = document.getElementById("AucInput");
                            var NB = document.getElementById("now_bid");

                            var aucHttp = new XMLHttpRequest();
                            aucHttp.onreadystatechange = function () {
                                if (this.readyState == 4 && this.status == 200) {
                                    var res = this.responseText;
                                    var aucList = res.split('\n');

                                    IT.innerHTML = "<img src=\"" + aucList[0] + "\" alt=\"Prize Image\"/>";
                                    PD.innerHTML = "<br/>"+aucList[1]+"<br/>";
                                    NB.innerHTML = "Now Bid : " + aucList[2] + " SAC " + aucList[3];

                                    $(FS).attr("disabled",aucList[4]=="false");

                                }
                            };
                            aucHttp.open("GET", "../auction/info", true);
                            aucHttp.send();

                        }, 1000);/*http://crunchify.com/how-to-refresh-div-content-without-reloading-page-using-jquery-and-ajax/*/
                    }
            });

		function nextGet(number_of_checked_in){
			var retVal = "Next is 50";
			var total_number = 29;
			if(number_of_checked_in==0){
			    retVal = "Have not visited any places yet. Visit any program and get 50"
            }
			if(number_of_checked_in%5==4){
				retVal += ("+"+(number_of_checked_in+1)*10);
			}
			if(number_of_checked_in+1 == 17){
                retVal += "+170 SAC! : To Celebrate 2017";
			}
			if(number_of_checked_in+1 == total_number){
                retVal = "Next is Hall of Fame + 1000";
            }
            if (number_of_checked_in == total_number) {
                retVal = "2018 SAF!";
            }
            else if (number_of_checked_in > total_number) {
                retVal = "Nowhere.... Where did you get it?";
            }
            else {
                retVal += " SAC!";
            }
            return retVal;
		}

		// Nav.
		$window.on('load resize',function(){
            var L = window.location.pathname.split("/");
            if(L[L.length-1].indexOf("main")!=-1){
                var $nav = $header.children('nav');
                $nav.empty();
                var LIs = [
                    ["Account","#account"],
                    ["Song Festival","#SFest"],
                    [" Check-In ","#checkin"],
                    [" Coupon ","#coupon"],
                    [" Auction ","#auction"],
                    [" Schedule ","#schedule"],
                    ["Lost Card","#help"],
                    ["Contact","#contact"]]
                var $newUL;
                for(var i=0;i<LIs.length;i++){
                    if(i%4==0){
                        if(i==0){
                            $nav.addClass("use-middle");
                            $newUL = $("<ul>",{});
                            $newUL.appendTo($nav);
                        }
                        if(i!=0&&$window.width()>1100){
                            var $br = $("<br>",{});
                            $newUL = $("<ul>",{});
                            $br.appendTo($nav);
                            $newUL.appendTo($nav);
                        }
                    }
                    var newA = $("<a />",{
                        id : LIs[i][1],
                        text : LIs[i][0],
                        href : LIs[i][1]
                    });
                    var $newLI = $("<li>",{});
                    newA.appendTo($newLI);
                    if($newUL.children().length % 2==0){
                        $newLI.addClass("is-middle");
                    }
                    $newLI.appendTo($newUL);
                }
            }
        });

		// Main.
			var	delay = 325,
				locked = false;

			// Methods.
				$main._show = function(id, initial) {

					var $article = $main_articles.filter('#' + id);

					// No such article? Bail.
						if ($article.length == 0)
							return;

					// Handle lock.

						// Already locked? Speed through "show" steps w/o delays.
							if (locked || (typeof initial != 'undefined' && initial === true)) {

								// Mark as switching.
									$body.addClass('is-switching');

								// Mark as visible.
									$body.addClass('is-article-visible');

								// Deactivate all articles (just in case one's already active).
									$main_articles.removeClass('active');

								// Hide header, footer.
									$header.hide();
									$footer.hide();

								// Show main, article.
									$main.show();
									$article.show();

								// Activate article.
									$article.addClass('active');

								// Unlock.
									locked = false;

								// Unmark as switching.
									setTimeout(function() {
										$body.removeClass('is-switching');
									}, (initial ? 1000 : 0));

								return;

							}

						// Lock.
							locked = true;

					// Article already visible? Just swap articles.
						if ($body.hasClass('is-article-visible')) {

							// Deactivate current article.
								var $currentArticle = $main_articles.filter('.active');

								$currentArticle.removeClass('active');

							// Show article.
								setTimeout(function() {

									// Hide current article.
										$currentArticle.hide();

									// Show article.
										$article.show();

									// Activate article.
										setTimeout(function() {

											$article.addClass('active');

											// Window stuff.
												$window
													.scrollTop(0)
													.triggerHandler('resize.flexbox-fix');

											// Unlock.
												setTimeout(function() {
													locked = false;
												}, delay);

										}, 25);

								}, delay);

						}

					// Otherwise, handle as normal.
						else {

							// Mark as visible.
								$body
									.addClass('is-article-visible');

							// Show article.
								setTimeout(function() {

									// Hide header, footer.
										$header.hide();
										$footer.hide();

									// Show main, article.
										$main.show();
										$article.show();

									// Activate article.
										setTimeout(function() {

											$article.addClass('active');

											// Window stuff.
												$window
													.scrollTop(0)
													.triggerHandler('resize.flexbox-fix');

											// Unlock.
												setTimeout(function() {
													locked = false;
												}, delay);

										}, 25);

								}, delay);

						}

				};

				$main._hide = function(addState) {

					var $article = $main_articles.filter('.active');

					// Article not visible? Bail.
						if (!$body.hasClass('is-article-visible'))
							return;

					// Add state?
						if (typeof addState != 'undefined'
						&&	addState === true)
							history.pushState(null, null, '#');

					// Handle lock.

						// Already locked? Speed through "hide" steps w/o delays.
							if (locked) {

								// Mark as switching.
									$body.addClass('is-switching');

								// Deactivate article.
									$article.removeClass('active');

								// Hide article, main.
									$article.hide();
									$main.hide();

								// Show footer, header.
									$footer.show();
									$header.show();

								// Unmark as visible.
									$body.removeClass('is-article-visible');

								// Unlock.
									locked = false;

								// Unmark as switching.
									$body.removeClass('is-switching');

								// Window stuff.
									$window
										.scrollTop(0)
										.triggerHandler('resize.flexbox-fix');

								return;

							}

						// Lock.
							locked = true;

					// Deactivate article.
						$article.removeClass('active');

					// Hide article.
						setTimeout(function() {

							// Hide article, main.
								$article.hide();
								$main.hide();

							// Show footer, header.
								$footer.show();
								$header.show();

							// Unmark as visible.
								setTimeout(function() {

									$body.removeClass('is-article-visible');

									// Window stuff.
										$window
											.scrollTop(0)
											.triggerHandler('resize.flexbox-fix');

									// Unlock.
										setTimeout(function() {
											locked = false;
										}, delay);

								}, 25);

						}, delay);


				};

			// Articles.
				$main_articles.each(function() {

					var $this = $(this);

					// Close.
						$('<div class="close">Close</div>')
							.appendTo($this)
							.on('click', function() {
								location.hash = '';
							});

					// Prevent clicks from inside article from bubbling.
						$this.on('click', function(event) {
							event.stopPropagation();
						});

				});

			// Events.
				$body.on('click', function(event) {

					// Article visible? Hide.
						if ($body.hasClass('is-article-visible'))
							$main._hide(true);

				});

				$window.on('keyup', function(event) {

					switch (event.keyCode) {

						case 27:

							// Article visible? Hide.
								if ($body.hasClass('is-article-visible'))
									$main._hide(true);

							break;

						default:
							break;

					}

				});

				$window.on('hashchange', function(event) {

					// Empty hash?
						if (location.hash == ''
						||	location.hash == '#') {

							// Prevent default.
								event.preventDefault();
								event.stopPropagation();

							// Hide.
								$main._hide();

						}

					// Otherwise, check for a matching article.
						else if ($main_articles.filter(location.hash).length > 0) {

							// Prevent default.
								event.preventDefault();
								event.stopPropagation();

							// Show article.
								$main._show(location.hash.substr(1));

						}

				});

			// Scroll restoration.
			// This prevents the page from scrolling back to the top on a hashchange.
				if ('scrollRestoration' in history)
					history.scrollRestoration = 'manual';
				else {

					var	oldScrollPos = 0,
						scrollPos = 0,
						$htmlbody = $('html,body');

					$window
						.on('scroll', function() {

							oldScrollPos = scrollPos;
							scrollPos = $htmlbody.scrollTop();

						})
						.on('hashchange', function() {
							$window.scrollTop(oldScrollPos);
						});

				}

			// Initialize.

				// Hide main, articles.
					$main.hide();
					$main_articles.hide();

				// Initial article.
					if (location.hash != ''
					&&	location.hash != '#')
						$window.on('load', function() {
							$main._show(location.hash.substr(1), true);
						});

	});

})(jQuery);
