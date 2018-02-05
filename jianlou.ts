// ==UserScript==
// @name        网易云音乐拾遗
// @description 本脚本可以帮你收集任意歌单里涉及歌手的热门歌曲到一份新的歌单中
// @namespace   lonr.github.io
// @version     0.0.4
// @author      lonr
// @grant       GM_addStyle
// @match       *://music.163.com/#/*
// @include     http://music.163.com/*
// @noframes
// @compatible  firefox, chrome
// @incompatible    edge
// @supportURL  http://music.163.com/#/playlist?id=746621854
// @license GPL
// ==/UserScript==

declare function GM_addStyle(css: string): void;

interface Song {
    songName: string;
    songHref: string;
}

interface Artist {
    name: string;
    homepage: string;
    songs: Song[];
    topSongs: Song[];
}

interface Options {
    limit: number;
    nevermore: boolean;
    allNew: boolean;
    delay: number;
    // listName: string;
}

class Picker {
    static version = '0.0.4';
    static options: Options = {
        limit: 3,
        // true（默认）或者 false（收藏前 limit 个） 
        // 只收藏比歌单里歌曲更热门的歌曲（不管怎样：原来的歌是在的）
        nevermore: true,
        // 请求间隔毫秒数（每个歌手会请求一次，不知道多少会被 ban）
        allNew: true,
        delay: 0,
        // 默认设置为“拾遗-”跟上原歌单名
        // listName: '',
    };
    artistsMap: string[] = [];
    artists: Artist[] = [];
    innerWindow: Window;
    innerDocument: HTMLDocument;
    document: Document;

    UIEle: Element | null;
    startEle: Element | null;
    loggerEle: Element | null;

    isListPage: boolean = false;
    isRunning: boolean = false;

    get isAbleToStart() {
        return this.isListPage && !this.isRunning;
    }

    constructor(public window: Window) {
        this.document = window.document;
        // iframe window 是不变的，切换页面后 document 会变！！！
        this.innerWindow = (window.document.getElementById('g_iframe') as HTMLIFrameElement).contentWindow;
        this.innerDocument = this.innerWindow.document;
        this.addUI();
        this.initUI();
        this.innerWindow.frameElement.addEventListener('load', () => {
            this.initUI();
        });

    }

    /**
     * 添加UI，绑定了 start 按钮的事件！！！
     */
    addUI() {
        let container = this.UIEle = this.document.createElement('aside');
        container.className = 'jl-UI';
        container.innerHTML = `
            <h1>
                网易云音乐拾遗 ${Picker.version} by lonr
            </h1>
            <p>
                本脚本能帮你收集任意歌单里涉及歌手的热门歌曲到一份新的歌单中
            </p>
            <p>
                请登录并通过<a href="${(this.document.querySelector('.itm-1') as HTMLAnchorElement).href}">“我的主页”</a>或者<a href="http://music.163.com/discover/playlist">“发现音乐-歌单”</a>打开任一歌单
            </p>
            <div class="jl-options">
                <div class="jl-limit">
                    <h2><label for="limit">收藏热门歌曲 TOP <input type="number" name="limit" id="limit" value="3" min="0" max="10"></label></h2>
                </div>
                <div class="jl-nevermore">
                    <h2>，但只收藏更热门的歌曲？</h2>
                    <p>
                        <input type="radio" name="nevermore" id="nevermore-true" checked value="true"><label for="nevermore-true">是</label>
                        <input type="radio" name="nevermore" id="nevermore-false" value="false"><label for="nevermore-false">否</label>
                    </p>
                </div>
                <div class="jl-allNew">
                    <h2>丢弃原歌曲？</h2>
                    <p>
                        <input type="radio" name="allNew" id="allNew-true" checked value="true"><label for="allNew-true">是</label>
                        <input type="radio" name="allNew" id="allNew-false" value="false"><label for="allNew-false">否</label>
                    </p>
                </div>
                <p>
                    <button class="jl-start" ${this.isAbleToStart ? '' : 'disabled '}type="button">${this.isAbleToStart ? '点击这里开始拾遗' : '不在歌单页面或者正在运行中'}</button>
                </p>      
                <p class="jl-log">请进入任一歌单页以使用本脚本
                </p>      
                <p class="jl-newList">
                    
                </p>
            </div>
            <p class="jl-about">如需帮助可以<a href="mailto:lonr@live.cn">邮件我</a></p>
        `;
        this.document.body.appendChild(container);
        GM_addStyle(`
            .jl-UI {
                position: absolute;
                right: 2em;
                top: 100px;
                width: 15em;
                padding: 1em;
                font-size: 14px;
                font-family: sans-serif;
                background: #fff;
            }
            .jl-UI h1 {
                text-align: center;
                margin-bottom: 1em;
            }
            .jl-UI p:first-of-type {
                margin-bottom: 0.5em;
            }
            .jl-UI a {
                color: #C10D0C;
            }
            .jl-options {
                margin-top: 1em;
                margin-bottom: 1em;
            }
            .jl-options p {
                text-align: center;
                margin: 0.5em 0;
            }
            .jl-UI input, .jl-UI button {
                font-size: 14px;
            }
            .jl-nevermore input, .jl-allNew input {
                width: 2em;
            }
            .jl-limit input {
                margin-right: 0.5em;
                width: 3em;
            }
            .jl-start {
                margin: 0.5em 0;
                border: solid 1px #C10D0C !important;
                padding: 0.2em 0.2em;
                color: #C10D0C;
                background: #fff;
            }
            .jl-start[disabled] {
                border-color: grey !important;
                color: grey;         
                cursor: no-drop;
            }
            .jl-log {
                white-space: pre-line;
            }
        `);
        this.loggerEle = this.document.querySelector('.jl-log');
        this.startEle = this.document.querySelector('.jl-start');
        this.startEle!.addEventListener('click', () => {
            this.setStartBtn(false);
            this.setOptions();
            this.start().catch(this.log);
        });
    }

    setStartBtn(active: boolean) {
        if (active) {
            (this.startEle as HTMLButtonElement).disabled = false;
            (this.startEle as HTMLButtonElement).innerText = '点击这里开始';
        } else {
            (this.startEle as HTMLButtonElement).disabled = true;
            (this.startEle as HTMLButtonElement).innerText = '不在歌单页面或者正在运行中';
        }
    }

    /**
     * 设置按钮状态
     */
    initUI() {
        this.isListPage = this.window.document.location.hash.includes('#/playlist');
        if (this.isAbleToStart) {
            // this.innerWindow = (window.document.getElementById('g_iframe') as HTMLIFrameElement).contentWindow;
            this.innerDocument = this.innerWindow.document;
            this.setStartBtn(true);
            this.getArtistsList();
        } else {
            this.setStartBtn(false);
        }
    }

    async start() {
        this.isRunning = true;
        await this.setSongs();
        this.log('创建歌单完成，上传并等待服务器处理中');
        await this.postList();
        this.isRunning = false;
    }

    setOptions() {
        let nevermoreTrueRadio = this.UIEle!.querySelector('.jl-nevermore #nevermore-true')! as HTMLInputElement
        Picker.options.nevermore = nevermoreTrueRadio.checked;

        let allNewTrueRadio = this.UIEle!.querySelector('.jl-allNew #allNew-true')! as HTMLInputElement
        Picker.options.allNew = allNewTrueRadio.checked;

        Picker.options.limit = Number((this.UIEle!.querySelector('#limit') as HTMLInputElement).value);

        // let listName = this.innerDocument.querySelector('.f-ff2.f-brk')!.textContent;
        // Picker.options.listName = (this.UIEle!.querySelector('#listName') as HTMLInputElement).value.replace('原歌单名', listName!);
    }


    getArtistsList() {
        this.artists = [];
        this.artistsMap = [];
        let songList = this.innerDocument.querySelector('.m-table tbody')!.children;
        for (let song of Array.from(songList)) {
            let songEle = song.querySelector('.f-cb a b') as HTMLElement;
            let songName = songEle.title.replace(/\s/g, ' ');
            let songHref = songEle.getAttribute('href') || '';

            let artistEle = song.querySelector('td:nth-of-type(4) > div > span') as HTMLElement;
            let name = artistEle.title.replace(/\s/g, ' ');
            // FIXME：多作者歌曲、无详情页作者
            // 2018年2月5日：就不！
            let anchor = artistEle.querySelector('a');
            let homepage = anchor ? (anchor.getAttribute('href') || '') : '';

            let index = this.artistsMap.indexOf(name);
            if (index < 0) {
                this.artistsMap.push(name);
                this.artists.push(
                    {
                        name: name,
                        homepage: homepage,
                        songs: [],
                        topSongs: []
                    }
                );
                index = this.artistsMap.length - 1;
            }
            this.artists[index].songs.push(
                {
                    songName: songName,
                    songHref: songHref,
                }
            );
        }
        this.log(`此歌单共有 ${this.artists.length} 位歌手`);
        // \n将消耗至少 ${Math.floor(this.artists.length * Picker.options.delay / 1000)}s
    }


    /**
     * 获取并设置一个歌手的热门歌曲
     * @param artist 
     */
    setTopSongs(artist: Artist) {
        return fetch(artist.homepage!).then((response) => {
            if (response.status !== 200) {
                return Promise.reject(response.status);
            }
            return response.text();
        }).then((data: string) => {
            let result = /<ul class="f-hide">(?:[^]*?)<\/ul>/.exec(data)![0];
            let parser = new DOMParser();
            let doc = parser.parseFromString(result, 'text/html').querySelector('.f-hide');
            return doc!.children;
        }).then((listItems: HTMLCollection) => {
            for (let list of Array.from(listItems)) {
                artist.topSongs.push({
                    songName: list.textContent!.replace(/\s/g, ' '),
                    // Chrome 不能通过 href attr 获得。以下（包括其他同）的链接可能不是完整的
                    songHref: (list.firstElementChild as HTMLAnchorElement).getAttribute('href') || ''
                });
            }
        }).catch((reason: any) => {
            console.log(`获得热门歌曲时出错：${reason}`);
        });
    }

    // 按照设置添加将要收藏的歌曲
    async setSongs() {
        let limit = Picker.options.limit;
        let nevermore = Picker.options.nevermore;
        let allNew = Picker.options.allNew;
        let delay = Picker.options.delay;
        let artistCount = this.artists.length;
        for (let artist of this.artists) {
            if (artist.homepage === '') {
                artistCount--;
                continue;
            }
            let songNameSet = new Set(artist.songs.map(song => song.songName));
            if (allNew) artist.songs = [];
            // NEVER TODO：并发
            await this.setTopSongs(artist);
            let len = artist.topSongs.length;
            limit = limit <= len ? limit : len;
            for (let rank = 0; rank < limit; rank++) {
                let songName = artist.topSongs[rank].songName;
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
            this.log(`完成 ${artist.name}`);
            if (artistCount > 0) {
                await this.sleep(delay);
            }
        }
    }

    /**
     * 从歌手数组（不指定参数则从实例中取得）生成歌单文件
     * @param artists 
     */
    createKgl(artists = this.artists) {
        let xmldom = document.implementation.createDocument(null, 'List', null);
        xmldom.documentElement.setAttribute('ListName', '歌单名坏掉了！');
        for (let artist of artists) {
            for (let song of artist.songs) {
                let fileTag = xmldom.createElement('File');
                let fileNameTag = xmldom.createElement('FileName');
                fileNameTag.appendChild(xmldom.createTextNode(artist.name + '-' + song.songName));
                fileTag.appendChild(fileNameTag);
                xmldom.documentElement.appendChild(fileTag);
            }
        }
        let str = new XMLSerializer().serializeToString(xmldom);
        // return new File([str], Picker.options.listName + '.kgl');
        return new File([str], '歌单名坏掉了.kgl');
        
    }

    /**
     * 从歌单 xml 文件（不指定参数则从实例中取得）生成 formdata 并 post 之
     * @param file 歌单 xml 文件
     */
    async postList(kgl?: File) {
        if (!kgl) {
            kgl = this.createKgl();
        }
        let fd = new FormData();
        fd.append('fileupload', kgl);
        let token: string;
        let result = /__csrf=(\w*)\b/.exec(document.cookie);
        if (!result || !result[1]) {
            return Promise.reject('cookie 获取失败');
        } else {
            token = result[1];
        }
        return await fetch(`http://music.163.com/api/playlist/import/kugou?csrf_token=${token}`, {
            method: 'POST',
            credentials: 'same-origin',
            body: fd
        }).then((response) => {
            if (response.status === 200) {
                console.log('歌单上传成功');
            }
            return response.json();
        }).then(json => {
            if (json.code !== 200) {
                this.log('貌似上传失败了');
            } else if (Number(json.addedPlaylists) > 0) {
                let addedSongs = json.addedSongs || '0';
                let matchedSongs = json.matchedSongs || '0';
                let unmatchedSongs = json.unmatchedSongs || '0';
                let duplicatedSongs = json.duplicatedSongs || '0';
                this.log(`上传成功，匹配：${matchedSongs} 首，重复：${duplicatedSongs} 首，未匹配：${unmatchedSongs} 首，添加：${addedSongs} 首。`);
                let linkWrapEle = this.UIEle!.querySelector('.jl-newList')!;
                linkWrapEle.textContent = '';
                let link = this.document.createElement('a');
                link.href = `http://music.163.com/#/playlist?id=${json.addedPlaylistIds[0]}`;
                link.textContent = '点击这里查看新歌单';
                linkWrapEle.appendChild(link);
            }
        }).catch(reason => {
            this.log(`歌单上传失败：${reason}`);
        });
    }

    sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    log(message: string) {
        if (this.loggerEle) {
            this.loggerEle.textContent = message;
        } else {
            console.log(message);
        }
    }
}

// let picker = new Picker(window);
window.addEventListener('load', () => {
    let picker = new Picker(window);
}, false);
