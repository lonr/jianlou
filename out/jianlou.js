// ==UserScript==
// @name        云音乐捡漏
// @description 一个帮助收藏网易云歌曲的脚本
// @namespace   lonr.github.io
// @version     0.0.2
// @author      lonr
// @grant       GM_addStyle
// @match       *://music.163.com/#/*
// @include     http://music.163.com/*
// @noframes
// @compatible  Firefox, chrome
// @incompatible    Edge
// ==/UserScript==
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Picker = (function () {
    function Picker(window) {
        var _this = this;
        this.window = window;
        this.artistsMap = [];
        this.artists = [];
        this.isListPage = false;
        this.isRunning = false;
        this.document = window.document;
        // iframe 是不变的，切换页面后 document 会变！！！
        this.innerWindow = window.document.getElementById('g_iframe').contentWindow;
        this.innerDocument = this.innerWindow.document;
        this.addUI();
        this.initUI();
        this.innerWindow.frameElement.addEventListener('load', function () {
            _this.initUI();
        });
    }
    Object.defineProperty(Picker.prototype, "isAbleToStart", {
        get: function () {
            return this.isListPage && !this.isRunning;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 添加UI，绑定了 start 按钮的事件！！！
     */
    Picker.prototype.addUI = function () {
        var _this = this;
        var container = this.UIEle = this.document.createElement('aside');
        container.className = 'jl-UI';
        container.innerHTML = "\n            <h1>\n                \u4E91\u97F3\u4E50\u6361\u6F0F " + Picker.version + " by lonr\n            </h1>\n            <p>\n                \u672C\u811A\u672C\u80FD\u5E2E\u4F60\u6536\u96C6\u4EFB\u610F\u6B4C\u5355\u91CC\u6D89\u53CA\u6B4C\u624B\u7684\u70ED\u95E8\u6B4C\u66F2\u5230\u4E00\u4EFD\u65B0\u7684\u6B4C\u5355\u4E2D\n            </p>\n            <p>\n                \u8BF7\u767B\u5F55\u5E76\u901A\u8FC7<a href=\"" + this.document.querySelector('.itm-1').href + "\">\u201C\u6211\u7684\u4E3B\u9875\u201D</a>\u6216\u8005<a href=\"http://music.163.com/discover/playlist\">\u201C\u53D1\u73B0\u97F3\u4E50-\u6B4C\u5355\u201D</a>\u6253\u5F00\u4EFB\u4E00\u6B4C\u5355\n            </p>\n            <div class=\"jl-options\">\n                <div class=\"jl-limit\">\n                    <h2><label for=\"limit\">\u6536\u85CF\u70ED\u95E8\u6B4C\u66F2\u524D TOP <input type=\"number\" name=\"limit\" id=\"limit\" value=\"3\" min=\"0\" max=\"10\"></label></h2>\n                </div>\n                <div class=\"jl-nevermore\">\n                    <h2>\uFF0C\u4F46\u53EA\u6536\u85CF\u66F4\u70ED\u95E8\u7684\u6B4C\u66F2\uFF1F</h2>\n                    <p>\n                        <input type=\"radio\" name=\"nevermore\" id=\"nevermore-true\" checked value=\"true\"><label for=\"nevermore-true\">\u662F</label>\n                        <input type=\"radio\" name=\"nevermore\" id=\"nevermore-false\" value=\"false\"><label for=\"nevermore-false\">\u5426</label>\n                    </p>\n                </div>\n                <div class=\"jl-listName\">\n                    <h2>\u65B0\u6B4C\u5355\u7684\u540D\u79F0\uFF08\u53EF\u4EE5\u5C06\u201C\u539F\u6B4C\u5355\u540D\u201D\u4FDD\u7559\u7528\u4F5C\u53D8\u91CF\u3002\u91CD\u540D\u53EF\u80FD\u4F1A\u8986\u76D6\u539F\u6765\u7684\u6B4C\u5355\uFF09\uFF1A</h2>\n                    <p><input type=\"text\" name=\"listName\" id=\"listName\" value=\"\u6361\u6F0F-\u539F\u6B4C\u5355\u540D\"></p>\n                </div>\n                <p>\n                    <button class=\"jl-start\" " + (this.isAbleToStart ? '' : 'disabled ') + "type=\"button\">" + (this.isAbleToStart ? '点击这里开始捡漏' : '不在歌单页面或者正在运行中') + "</button>\n                </p>      \n                <p class=\"jl-log\">\u8BF7\u8FDB\u5165\u4EFB\u4E00\u6B4C\u5355\u9875\u4EE5\u4F7F\u7528\u672C\u811A\u672C\n                </p>      \n                <p class=\"jl-newList\">\n                    \n                </p>\n            </div>\n            <p class=\"jl-about\">\u5982\u9700\u5E2E\u52A9\u53EF\u4EE5\u5230<a href=\"http://music.163.com/#/playlist?id=746621854\" target=\"_blank\">\u8FD9\u4EFD\u6B4C\u5355</a>\u4E0B\u67E5\u770B\u6216\u63D0\u95EE</p>\n        ";
        this.document.body.appendChild(container);
        GM_addStyle("\n            .jl-UI {\n                position: absolute;\n                right: 2em;\n                top: 100px;\n                width: 15em;\n                padding: 1em;\n                font-size: 14px;\n                font-family: sans-serif;\n                background: #fff;\n            }\n            .jl-UI h1 {\n                text-align: center;\n                margin-bottom: 1em;\n            }\n            .jl-UI p:first-of-type {\n                margin-bottom: 0.5em;\n            }\n            .jl-UI a {\n                color: #C10D0C;\n            }\n            .jl-options {\n                margin-top: 1em;\n                margin-bottom: 1em;\n            }\n            .jl-options p {\n                text-align: center;\n                margin: 0.5em 0;\n            }\n            .jl-UI input, .jl-UI button {\n                font-size: 14px;\n            }\n            .jl-nevermore input {\n                width: 2em;\n            }\n            .jl-limit input {\n                margin-right: 0.5em;\n                width: 3em;\n            }\n            .jl-start {\n                margin: 0.5em 0;\n                border: solid 1px #C10D0C !important;\n                padding: 0.2em 0.2em;\n                color: #C10D0C;\n                background: #fff;\n            }\n            .jl-start[disabled] {\n                border-color: grey !important;\n                color: grey;         \n                cursor: no-drop;\n            }\n            .jl-log {\n                white-space: pre-line;\n            }\n        ");
        this.loggerEle = this.document.querySelector('.jl-log');
        this.startEle = this.document.querySelector('.jl-start');
        this.startEle.addEventListener('click', function () {
            _this.setStartBtn(false);
            _this.setOptions();
            _this.start().catch(_this.log);
        });
    };
    Picker.prototype.setStartBtn = function (active) {
        if (active) {
            this.startEle.disabled = false;
            this.startEle.innerText = '点击这里开始捡漏';
        }
        else {
            this.startEle.disabled = true;
            this.startEle.innerText = '不在歌单页面或者正在运行中';
        }
    };
    /**
     * 设置按钮状态
     */
    Picker.prototype.initUI = function () {
        this.isListPage = this.window.document.location.hash.includes('#/playlist');
        if (this.isAbleToStart) {
            // this.innerWindow = (window.document.getElementById('g_iframe') as HTMLIFrameElement).contentWindow;
            this.innerDocument = this.innerWindow.document;
            this.setStartBtn(true);
            this.getArtistsList();
        }
        else {
            this.setStartBtn(false);
        }
    };
    Picker.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isRunning = true;
                        return [4 /*yield*/, this.setSongs()];
                    case 1:
                        _a.sent();
                        this.log('创建歌单完成，上传中。。。');
                        return [4 /*yield*/, this.postList()];
                    case 2:
                        _a.sent();
                        this.isRunning = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    Picker.prototype.setOptions = function () {
        var nevermore = true;
        // 获取设置的 nervermore 值
        Array.from(this.UIEle.querySelectorAll('.jl-nevermore p input')).forEach(function (ele) {
            var radio = ele;
            radio.checked ? nevermore = radio.value === 'true' ? true : false : 0;
        });
        Picker.options.nevermore = nevermore;
        Picker.options.limit = Number(this.UIEle.querySelector('#limit').value);
        var listName = this.innerDocument.querySelector('.f-ff2.f-brk').textContent;
        Picker.options.listName = this.UIEle.querySelector('#listName').value.replace('原歌单名', listName);
    };
    Picker.prototype.getArtistsList = function () {
        this.artists = [];
        this.artistsMap = [];
        var songList = this.innerDocument.querySelector('.m-table tbody').children;
        for (var _i = 0, _a = Array.from(songList); _i < _a.length; _i++) {
            var song = _a[_i];
            var songEle = song.querySelector('.f-cb a');
            var songName = songEle.textContent.replace(/\s/g, ' ');
            var songHref = songEle.getAttribute('href') || '';
            var artistEle = song.querySelector('td:nth-of-type(4) > div > span');
            var name_1 = artistEle.textContent.replace(/\s/g, ' ');
            // FIXME：多作者歌曲、无详情页作者
            var anchor = artistEle.querySelector('a');
            var homepage = anchor ? (anchor.getAttribute('href') || '') : '';
            var index = this.artistsMap.indexOf(name_1);
            if (index < 0) {
                this.artistsMap.push(name_1);
                this.artists.push({
                    name: name_1,
                    homepage: homepage,
                    songs: [],
                    topSongs: []
                });
                index = this.artistsMap.length - 1;
            }
            this.artists[index].songs.push({
                songName: songName,
                songHref: songHref,
            });
        }
        this.log("\u6B64\u6B4C\u5355\u5171\u6709 " + this.artists.length + " \u4F4D\u6B4C\u624B");
        // \n将消耗至少 ${Math.floor(this.artists.length * Picker.options.delay / 1000)}s
    };
    /**
     * 获取并设置一个歌手的热门歌曲
     * @param artist
     */
    Picker.prototype.setTopSongs = function (artist) {
        return fetch(artist.homepage).then(function (response) {
            if (response.status !== 200) {
                // console.log(response.status);
                return Promise.reject(response.status);
            }
            return response.text();
        }).then(function (data) {
            var result = /<ul class="f-hide">(?:[^]*?)<\/ul>/.exec(data)[0];
            var parser = new DOMParser();
            var doc = parser.parseFromString(result, 'text/html').querySelector('.f-hide');
            return doc.children;
        }).then(function (listItems) {
            for (var _i = 0, _a = Array.from(listItems); _i < _a.length; _i++) {
                var list = _a[_i];
                artist.topSongs.push({
                    songName: list.textContent.replace(/\s/g, ' '),
                    // Chrome 不能通过 href attr 获得。以下（包括其他同）的链接可能不是完整的
                    songHref: list.firstElementChild.getAttribute('href') || ''
                });
            }
        }).catch(function (reason) {
            console.log("\u83B7\u5F97\u70ED\u95E8\u6B4C\u66F2\u65F6\u51FA\u9519\uFF1A" + reason);
        });
    };
    // 按照设置添加将要收藏的歌曲
    Picker.prototype.setSongs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var limit, nevermore, delay, artistCount, _i, _a, artist, songNameSet, len, rank, songName;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        limit = Picker.options.limit;
                        nevermore = Picker.options.nevermore;
                        delay = Picker.options.delay;
                        artistCount = this.artists.length;
                        _i = 0, _a = this.artists;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        artist = _a[_i];
                        if (artist.homepage === '') {
                            artistCount--;
                            return [3 /*break*/, 4];
                        }
                        songNameSet = new Set(artist.songs.map(function (song) { return song.songName; }));
                        return [4 /*yield*/, this.setTopSongs(artist)];
                    case 2:
                        _b.sent();
                        len = artist.topSongs.length;
                        limit = limit <= len ? limit : len;
                        for (rank = 0; rank < limit; rank++) {
                            songName = artist.topSongs[rank].songName;
                            if (songNameSet.has(songName)) {
                                songNameSet.delete(songName);
                                continue;
                            }
                            if (nevermore && songNameSet.size === 0) {
                                break;
                            }
                            artist.songs.push(artist.topSongs[rank]);
                        }
                        artistCount--;
                        this.log("\u5B8C\u6210 " + artist.name);
                        if (!(artistCount > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sleep(delay)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 从歌手数组（不指定参数则从实例中取得）生成歌单文件
     * @param artists
     */
    Picker.prototype.createKgl = function (artists) {
        if (artists === void 0) { artists = this.artists; }
        var xmldom = document.implementation.createDocument(null, 'List', null);
        xmldom.documentElement.setAttribute('ListName', Picker.options.listName);
        for (var _i = 0, artists_1 = artists; _i < artists_1.length; _i++) {
            var artist = artists_1[_i];
            for (var _a = 0, _b = artist.songs; _a < _b.length; _a++) {
                var song = _b[_a];
                var fileTag = xmldom.createElement('File');
                var fileNameTag = xmldom.createElement('FileName');
                fileNameTag.appendChild(xmldom.createTextNode(artist.name + '-' + song.songName));
                fileTag.appendChild(fileNameTag);
                xmldom.documentElement.appendChild(fileTag);
            }
        }
        var str = new XMLSerializer().serializeToString(xmldom);
        return new File([str], Picker.options.listName + '.kgl');
    };
    /**
     * 从歌单 xml 文件（不指定参数则从实例中取得）生成 formdata 并 post 之
     * @param file 歌单 xml 文件
     */
    Picker.prototype.postList = function (kgl) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var fd, token, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!kgl) {
                            kgl = this.createKgl();
                        }
                        fd = new FormData();
                        fd.append('fileupload', kgl);
                        result = /__csrf=(\w*)\b/.exec(document.cookie);
                        if (!result || !result[1]) {
                            return [2 /*return*/, Promise.reject('cookie 获取失败')];
                        }
                        else {
                            token = result[1];
                        }
                        return [4 /*yield*/, fetch("http://music.163.com/api/playlist/import/kugou?csrf_token=" + token, {
                                method: 'POST',
                                credentials: 'same-origin',
                                body: fd
                            }).then(function (response) {
                                // if (response.status !== 200) {
                                //     return Promise.reject(response.status);
                                // }
                                if (response.status === 200) {
                                    console.log('歌单上传成功');
                                }
                                return response.json();
                            }).then(function (json) {
                                if (json.code !== 200) {
                                    _this.log('貌似上传失败了');
                                }
                                else if (Number(json.addedPlaylists) > 0) {
                                    var addedSongs = json.addedSongs || 0;
                                    var matchedSongs = json.matchedSongs || 0;
                                    var unmatchedSongs = json.unmatchedSongs || 0;
                                    var duplicatedSongs = json.duplicatedSongs || 0;
                                    _this.log("\u4E0A\u4F20\u6210\u529F\uFF0C\u5339\u914D\uFF1A" + matchedSongs + " \u9996\uFF0C\u91CD\u590D\uFF1A" + duplicatedSongs + " \u9996\uFF0C\u672A\u5339\u914D\uFF1A" + unmatchedSongs + " \u9996\uFF0C\u6DFB\u52A0\uFF1A" + addedSongs + " \u9996\u3002");
                                    var linkWrapEle = _this.UIEle.querySelector('.jl-newList');
                                    linkWrapEle.textContent = '';
                                    var link = _this.document.createElement('a');
                                    link.href = "http://music.163.com/#/playlist?id=" + json.addedPlaylistIds[0];
                                    link.textContent = '点击这里查看新歌单';
                                    linkWrapEle.appendChild(link);
                                }
                            }).catch(function (reason) {
                                _this.log("\u6B4C\u5355\u4E0A\u4F20\u5931\u8D25\uFF1A" + reason);
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Picker.prototype.sleep = function (ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    };
    Picker.prototype.log = function (message) {
        if (this.loggerEle) {
            this.loggerEle.textContent = message;
        }
        else {
            console.log(message);
        }
    };
    return Picker;
}());
Picker.version = '0.0.2';
Picker.options = {
    limit: 3,
    // ture（默认）或者 false（收藏前 limit 个） 
    // 只收藏比歌单里歌曲更热门的歌曲（不管怎样：原来的歌是在的）
    nevermore: true,
    // 请求间隔毫秒数（每个歌手会请求一次，不知道多少会被 ban）
    delay: 0,
    // 默认设置为“拾遗-”跟上原歌单名
    listName: '',
};
// let picker = new Picker(window);
window.addEventListener('load', function () {
    var picker = new Picker(window);
}, false);
