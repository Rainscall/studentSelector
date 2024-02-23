"use strict"
const apiEndpoint = 'https://studentselector-backend.colorspark.net';
let selectedCharacter = [];

function init() {
    removeElementsByClassName('tempElement');
    infoArea.classList.add('shadowBorder');
    infoArea.innerHTML = '';
    const infoList = [
        ['圣晶石', '大于等于...', 'number', 'coins', {
            'step': 1,
            'min': 1
        }],
        ['搜索', '名称或外号', 'text', 'things']
    ];
    for (let i = 0; i < infoList.length; i++) {
        let base = document.createElement('div');
        let title = document.createElement('div');
        let value = document.createElement('div');
        let form = document.createElement('form');
        let input = document.createElement('input');
        base.classList.add('childPart');
        base.style.cursor = 'text';
        title.innerText = infoList[i][0];

        input.placeholder = infoList[i][1];
        input.type = infoList[i][2];
        input.required = 'required';

        if (typeof infoList[i][4] == 'object') {
            for (let j = 0; j < Object.keys(infoList[i][4]).length; j++) {
                const currentKey = Object.keys(infoList[i][4])[j];
                const currentValue = Object.values(infoList[i][4])[j];
                input.setAttribute(currentKey, currentValue);
            }
        }

        base.addEventListener('click', () => {
            input.focus();
        });

        form.onsubmit = (e) => {
            e.preventDefault();
            if (!input.value) {
                return;
            }
            let query = input.value.trim();

            if (isPotentialSQLInjection(query)) {
                input.value = '';
                createToast(`非法输入`, 4300, '#FFF', '#840D23');
                return;
            }

            createToast('正在查询', -1, '#FFF', '#414141', 'temp-search-loadingToast');

            doSearch(query, infoList[i][3])
                .then(r => {
                    if (r == 'NOT FOUND') {
                        createToast('未找到符合条件的项目', 4300, '#FFF', '#840D23');
                        input.value = '';
                    }
                })
        }

        form.appendChild(input);
        value.appendChild(form);
        base.appendChild(title);
        base.appendChild(value);
        infoArea.appendChild(base);
        if (i < infoList.length - 1) {
            infoArea.appendChild(document.createElement('hr'));
        }
    }
    infoArea.appendChild(document.createElement('hr'));
    (() => {
        let base = document.createElement('div');
        let title = document.createElement('div');
        let value = document.createElement('div');
        base.classList.add('childPart');
        value.classList.add('inlineSvgIcon');
        title.innerText = '英灵列表';
        value.style.transform = 'translateY(-1px)';
        value.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M384 32c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H384zM160 144c-13.3 0-24 10.7-24 24s10.7 24 24 24h94.1L119 327c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l135-135V328c0 13.3 10.7 24 24 24s24-10.7 24-24V168c0-13.3-10.7-24-24-24H160z"/></svg>';

        base.addEventListener('click', () => {
            openCharacterList();
        })

        base.appendChild(title);
        base.appendChild(value);
        infoArea.appendChild(base);
    })();

    (() => {
        if (selectedCharacter.length > 0) {
            infoArea.appendChild(document.createElement('hr'));
            let base = document.createElement('div');
            let title = document.createElement('div');
            let titleText = document.createElement('span');
            let titleIcon = document.createElement('div');
            let value = document.createElement('div');

            base.classList.add('selectedCharacterList');
            titleText.innerText = '已选择以下英灵';
            titleIcon.classList.add('inlineSvgIcon');
            titleIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>';
            title.appendChild(titleText);
            title.appendChild(titleIcon);

            titleIcon.addEventListener('click', () => {
                if (selectedCharacter.length === 0) {
                    createToast('至少需要选择一个英灵', 2540, '#FFF', '#414141', 'temp-search-loadingToast');
                    return;
                }
                let queryStr = '';
                for (let i = 0; i < selectedCharacter.length; i++) {
                    let str = `${selectedCharacter[i]}`;
                    if (selectedCharacter.length > 1 && i != selectedCharacter.length - 1) {
                        str += ',';
                    }
                    queryStr += str;
                }
                createToast('正在查询', -1, '#FFF', '#414141', 'temp-search-loadingToast');
                doSearch(queryStr, 'things')
                    .then(r => {
                        if (r == 'NOT FOUND') {
                            createToast('未找到符合条件的项目', 4300, '#FFF', '#840D23');
                        }
                    });
            });

            for (let i = 0; i < selectedCharacter.length; i++) {
                let base = document.createElement('div');
                let span = document.createElement('span');
                let img = document.createElement('div');

                span.innerText = selectedCharacter[i];
                img.classList.add('img');
                img.style.backgroundImage = `url('${picList[selectedCharacter[i]]}')`;

                base.addEventListener('click', () => {
                    selectedCharacter = selectedCharacter.filter(item => item !== span.innerText);
                    if (selectedCharacter.length === 0) {//处理英灵被删完的情况
                        init();
                        return;
                    }
                    base.parentNode.removeChild(base);
                });

                base.appendChild(img);
                base.appendChild(span);
                value.appendChild(base);
            }

            base.appendChild(title);
            base.appendChild(value);
            infoArea.appendChild(base);
        }

    })();
}
init();


async function openCharacterList() {
    infoArea.classList.remove('shadowBorder');
    infoArea.innerHTML = '';

    (() => {
        function quickQuery() {
            if (selectedCharacter.length === 0) {
                createToast('至少需要选择一个英灵', 2540, '#FFF', '#414141', 'temp-search-loadingToast');
                return;
            }
            let queryStr = '';
            for (let i = 0; i < selectedCharacter.length; i++) {
                let str = `${selectedCharacter[i]}`;
                if (selectedCharacter.length > 1 && i != selectedCharacter.length - 1) {
                    str += ',';
                }
                queryStr += str;
            }
            createToast('正在查询', -1, '#FFF', '#414141', 'temp-search-loadingToast');
            doSearch(queryStr, 'things')
                .then(r => {
                    if (r == 'NOT FOUND') {
                        createToast('未找到符合条件的项目', 4300, '#FFF', '#840D23');
                    }
                });
        }

        const functionList = [
            {
                'name': '返回',
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>',
                'callback': 'init'
            },
            {
                'name': '查询',
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>',
                'callback': 'quickQuery'
            },
            {
                'name': '顶部',
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M246.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 109.3 361.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160zm160 352l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 301.3 361.4 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z"/></svg>',
                'callback': `(()=>{infoArea.children[0].scrollIntoView({behavior: "smooth"});
                })`
            },
            {
                'name': '清空',
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg>',
                'callback': 'clearSelectedCharacter'
            }
        ]

        let base = document.createElement('div');
        let scrollBox = document.createElement('div');
        scrollBox.classList.add('scrollBox');
        for (let i = 0; i < functionList.length; i++) {
            let iconCotainer = document.createElement('div');
            let icon = document.createElement('div');
            let tip = document.createElement('div');

            base.classList.add('tempElement');
            base.classList.add('fixedBack');
            base.classList.add('shadowBorder');

            tip.innerText = functionList[i].name;
            icon.innerHTML = functionList[i].iconSvg;

            iconCotainer.addEventListener('click', eval(functionList[i].callback));
            iconCotainer.classList.add('iconCotainer');
            icon.classList.add('inlineSvgIcon');
            iconCotainer.appendChild(icon);
            iconCotainer.appendChild(tip);
            scrollBox.appendChild(iconCotainer);
        }

        base.appendChild(scrollBox);
        document.body.prepend(base);
    })()

    let blankDiv = document.createElement('div');
    blankDiv.style.height = '4.2rem';
    infoArea.appendChild(blankDiv);

    for (let i = 0; i < Object.keys(picList).length; i++) {
        const infoList = picList;
        const infoArea = document.getElementById('infoArea');
        const container = document.createElement('div');
        container.classList.add('shadowBorder');
        container.classList.add('infoContainer');
        container.classList.add('characterItem');

        const currentKey = Object.keys(infoList)[i];
        let base = document.createElement('div');
        let titleContainer = document.createElement('div');
        let title = document.createElement('div');
        let subtitle = document.createElement('div');
        let value = document.createElement('div');
        let pic = document.createElement('img');
        pic.loading = 'lazy';

        base.classList.add('childPart');
        base.id = `characterSelector-${currentKey}`;

        if (currentKey.indexOf('〔') > 0) {
            title.innerText = currentKey.split('〔')[0];
            subtitle.innerText = currentKey.split('〔')[1].split('〕')[0];
        } else {
            title.innerText = currentKey;
        }

        value.dataset.value = Object.values(infoList)[i];
        pic.src = Object.values(infoList)[i];

        pic.addEventListener('load', () => {
            let rgbcolor = getAverageRGB(pic);
            base.parentNode.style.backgroundColor = `rgb(${rgbcolor.r},${rgbcolor.g},${rgbcolor.b})`;
        })

        base.addEventListener('click', () => {
            if (selectedCharacter.includes(currentKey)) {
                base.classList.remove('selected');
                selectedCharacter = selectedCharacter.filter(item => item !== currentKey);
            } else {
                base.classList.add('selected');
                selectedCharacter.push(currentKey);
            }
        })

        value.appendChild(pic);
        titleContainer.appendChild(title);
        if (subtitle.innerText) {
            titleContainer.appendChild(subtitle);
        }
        base.appendChild(titleContainer);
        base.appendChild(value);
        container.appendChild(base);

        infoArea.appendChild(container);
    }

    //恢复已经选择的英灵
    for (let i = 0; i < selectedCharacter.length; i++) {
        document.getElementById(`characterSelector-${selectedCharacter[i]}`).classList.add('selected');
    }

}

async function writeInfo(r) {
    infoArea.classList.remove('shadowBorder');
    infoArea.innerHTML = '';
    (() => {
        let base = document.createElement('div');
        let iconCotainer = document.createElement('div');
        let icon = document.createElement('div');
        let tip = document.createElement('div');

        tip.innerText = '返回';
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>'

        iconCotainer.addEventListener('click', init);
        iconCotainer.classList.add('iconCotainer');
        icon.classList.add('inlineSvgIcon');
        iconCotainer.appendChild(icon);
        iconCotainer.appendChild(tip);
        base.appendChild(iconCotainer);
        infoArea.appendChild(base);
    })()

    for (let i = 0; i < r.accounts.length; i++) {
        const infoList = r.accounts[i];
        const infoArea = document.getElementById('infoArea');
        const container = document.createElement('div');
        container.classList.add('shadowBorder');
        container.classList.add('infoContainer');
        for (let i = 0; i < Object.keys(infoList).length; i++) {
            let currentValue = String(Object.values(infoList)[i]);
            const currentKey = Object.keys(infoList)[i];
            const displayKey = {
                'id': '编号',
                'tickets': '呼符',
                'coins': '圣晶石',
                'things': '英灵'
            }
            let displayValue = '';
            let base = document.createElement('div');
            let title = document.createElement('div');
            let value = document.createElement('div');

            base.classList.add('childPart');

            title.innerText = displayKey[currentKey];
            if (currentValue.indexOf('x,') > 0) {
                currentValue = currentValue.substring(0, currentValue.length - 1);
                currentValue = currentValue.split('x,');

                for (let j = 0; j < currentValue.length; j++) {
                    displayValue += currentValue[j];
                    if (j != currentValue.length - 1) {
                        displayValue += ' , ';
                    }
                }
            } else {
                displayValue = currentValue;
            }

            value.innerText = displayValue;
            value.dataset.value = displayValue;

            switch (currentKey) {
                case 'id': {
                    base.addEventListener('click', () => {
                        value.innerText = '已复制';
                        const textArea = document.createElement('textArea')
                        textArea.value = value.dataset.value;
                        textArea.style.width = 0
                        textArea.style.position = 'fixed'
                        textArea.style.left = '-999px'
                        textArea.style.top = '10px'
                        textArea.setAttribute('readonly', 'readonly')
                        document.body.appendChild(textArea)

                        textArea.select()
                        document.execCommand('copy')
                        document.body.removeChild(textArea)
                        let Interval = setInterval(() => {
                            value.innerText = value.dataset.value;
                            clearInterval(Interval);
                        }, 350)
                    })
                    break;
                }
            }

            base.appendChild(title);
            base.appendChild(value);
            container.appendChild(base);
            if (i < Object.keys(infoList).length - 1) {
                container.appendChild(document.createElement('hr'));
            }
        }

        infoArea.appendChild(container);
    }
}

async function doSearch(query = '1.1.1.1', type) {
    try {
        //检查是否是外号，如果带‘,’就不检查
        // if (query.indexOf(',') === 0 || aliasToName(query) !== false) {
        //     query = aliasToName(query);
        // }
        const r = await fetch(`${apiEndpoint}/?${type}=${encodeURIComponent(query)}`).then(r => r.json());
        removeElementsByClassName('temp-search-loadingToast', 500);
        if (r.status === 'NOT FOUND') {
            return 'NOT FOUND';
        }
        writeInfo(r);
    } catch (error) {
        removeElementsByClassName('temp-search-loadingToast');
        createToast(`请求失败\n${error}`, 4300, '#FFF', '#840D23');
    }
}

async function removeElementsByClassName(className, delay = 0) {
    setTimeout(() => {
        let ele = document.getElementsByClassName(className);
        for (let i = 0; i < ele.length; i++) {
            ele[i].parentNode.removeChild(ele[i]);
        }
    }, delay);
}

function createToast(info, time = 4300, color = '#FFF', bgColor = '#414141', exClassName) {
    if (!info) {
        return;
    }
    Toastify({
        text: info,
        duration: time,
        className: `info ${exClassName}`,
        position: "center",
        gravity: "top",
        style: {
            color: color,
            background: bgColor,
            borderRadius: "8px",
            wordWrap: "break-word",
            width: "fit-content",
            maxWidth: "80vw",
            boxShadow: "0 3px 6px -1px rgba(0, 0, 0, 0.217), 0 10px 36px -4px rgba(98, 98, 98, 0.171)"
        }
    }).showToast();
}

function isPotentialSQLInjection(input) {
    const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'UNION', 'OR', 'AND', 'FROM', 'WHERE', 'JOIN', 'INTO', 'VALUES'];
    const symbols = ["'", '"', ';', '--', '()', '@', ')and(', '$', '%'];

    // 检查关键词
    for (let i = 0; i < sqlKeywords.length; i++) {
        const regex = new RegExp('\\b' + sqlKeywords[i] + '\\b', 'i'); // 匹配整个单词
        if (regex.test(input)) {
            return true;
        }
    }

    // 检查符号
    for (let i = 0; i < symbols.length; i++) {
        if (input.includes(symbols[i])) {
            return true;
        }
    }

    // 检查常见绕过技巧
    const bypassPatterns = [
        /\/\*/, // 注释符号
        /(?:--\s*[^'"\r\n]*){2}/, // 双短横线注释
        /(?:\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$)/m, // 注释符号和双斜杠注释
        /(?:\\x0[01][0-9a-f])/i, // Unicode编码
        /(?:[,\s])?or(?:\s+|\()=[\s\S]*--/i, // OR注入
        /(?:[,\s])?and(?:\s+|\()=[\s\S]*--/i, // AND注入
        /(?:UNION\s+ALL[\s\S]*?--)/i, // UNION注入
        /(?:\binto\b\s*\b\w*\b\s*(?:\([^)]*\)|\bvalues\b)|\bvalues\b\s*\([^)]*\))/i // INTO和VALUES注入
    ];

    for (let i = 0; i < bypassPatterns.length; i++) {
        if (bypassPatterns[i].test(input)) {
            return true;
        }
    }

    return false;
}


function clearSelectedCharacter() {
    for (let i = 0; i < selectedCharacter.length; i++) {
        document.getElementById(`characterSelector-${selectedCharacter[i]}`).classList.remove('selected');
    }
    selectedCharacter = [];
    createToast('清除完成', 2640);
}

function getAverageRGB(imgEl) {

    let blockSize = 5,
        // only visit every 5 pixels
        defaultRGB = {
            r: 0,
            g: 0,
            b: 0
        },
        // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data,
        width,
        height,
        i = -4,
        length,
        rgb = {
            r: 0,
            g: 0,
            b: 0
        },
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch (e) {
        /* security error, img on diff domain */
        alert('x');
        return defaultRGB;
    }

    length = data.data.length;

    while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    return rgb;

}

function aliasToName(input) {
    input = input.toLowerCase();
    for (let i = 0; i < Object.keys(aliasList).length; i++) {
        if (Object.values(aliasList)[i].includes(input)) {
            return Object.keys(aliasList)[i];
        }
    }
    return false;
}

const picList = {
    "安德洛墨达": "./src/img/heroes/Servant406.jpg",
    "源赖光／丑御前": "./src/img/heroes/Servant403.jpg",
    "日本武尊": "./src/img/heroes/Servant402.jpg",
    "上杉谦信": "./src/img/heroes/Servant400.jpg",
    "武田晴信": "./src/img/heroes/Servant397.jpg",
    "托勒密": "./src/img/heroes/Servant394.jpg",
    "旺吉娜": "./src/img/heroes/Servant393.jpg",
    "梅柳齐娜": "./src/img/heroes/Servant390.jpg",
    "阿尔托莉雅・卡斯特": "./src/img/heroes/Servant284.jpg",
    "雨之魔女梣": "./src/img/heroes/Servant385.jpg",
    "美杜莎": "./src/img/heroes/Servant384.jpg",
    "杜尔伽": "./src/img/heroes/Servant383.jpg",
    "怖军": "./src/img/heroes/Servant381.jpg",
    "果心居士": "./src/img/heroes/Servant380.jpg",
    "所多玛之兽／德拉科": "./src/img/heroes/Servant377.jpg",
    "幼体／提亚马特": "./src/img/heroes/Servant376.jpg",
    "高杉晋作": "./src/img/heroes/Servant375.jpg",
    "女教皇若安": "./src/img/heroes/Servant374.jpg",
    "库库尔坎": "./src/img/heroes/Servant373.jpg",
    "特斯卡特利波卡": "./src/img/heroes/Servant371.jpg",
    "尼托克丽丝〔Alter〕": "./src/img/heroes/Servant370.jpg",
    "格里戈里・拉斯普京": "./src/img/heroes/Servant369.jpg",
    "布里托玛特": "./src/img/heroes/Servant368.jpg",
    "呼延灼": "./src/img/heroes/Servant365.jpg",
    "千利休": "./src/img/heroes/Servant362.jpg",
    "斯卡哈・斯卡蒂": "./src/img/heroes/Servant215.jpg",
    "伊吹童子": "./src/img/heroes/Servant299.jpg",
    "阿瓦隆女士": "./src/img/heroes/Servant353.jpg",
    "Archetype：Earth": "./src/img/heroes/Servant351.jpg",
    "源为朝": "./src/img/heroes/Servant350.jpg",
    "曲亭马琴": "./src/img/heroes/Servant349.jpg",
    "詹姆斯・莫里亚蒂": "./src/img/heroes/Servant346.jpg",
    "查理曼": "./src/img/heroes/Servant343.jpg",
    "君士坦丁十一世": "./src/img/heroes/Servant342.jpg",
    "超级班扬": "./src/img/heroes/Servant339.jpg",
    "征氏姐妹": "./src/img/heroes/Servant337.jpg",
    "马纳南・麦克・利尔〔巴泽特〕": "./src/img/heroes/Servant336.jpg",
    "暗之高扬斯卡娅": "./src/img/heroes/Servant334.jpg",
    "BeastⅣ": "./src/img/heroes/Servant333.jpg",
    "太公望": "./src/img/heroes/Servant331.jpg",
    "坂本龙马": "./src/img/heroes/Servant329.jpg",
    "出云阿国": "./src/img/heroes/Servant327.jpg",
    "雅克・德・莫莱": "./src/img/heroes/Servant324.jpg",
    "迦摩": "./src/img/heroes/Servant239.jpg",
    "冲田总司〔Alter〕": "./src/img/heroes/Servant209.jpg",
    "奥伯龙": "./src/img/heroes/Servant316.jpg",
    "光之高扬斯卡娅": "./src/img/heroes/Servant314.jpg",
    "妖精骑士兰斯洛特": "./src/img/heroes/Servant312.jpg",
    "摩根": "./src/img/heroes/Servant309.jpg",
    "克莱恩小姐": "./src/img/heroes/Servant307.jpg",
    "伽拉忒亚": "./src/img/heroes/Servant306.jpg",
    "阿摩耳〔卡莲〕": "./src/img/heroes/Servant305.jpg",
    "平景清": "./src/img/heroes/Servant303.jpg",
    "千子村正": "./src/img/heroes/Servant302.jpg",
    "弗栗多": "./src/img/heroes/Servant300.jpg",
    "芦屋道满": "./src/img/heroes/Servant297.jpg",
    "尼莫": "./src/img/heroes/Servant296.jpg",
    "梵高": "./src/img/heroes/Servant295.jpg",
    "卑弥呼": "./src/img/heroes/Servant292.jpg",
    "阿比盖尔・威廉姆斯〔夏〕": "./src/img/heroes/Servant289.jpg",
    "杀生院祈荒": "./src/img/heroes/Servant167.jpg",
    "旅行者": "./src/img/heroes/Servant281.jpg",
    "罗穆路斯・奎里努斯": "./src/img/heroes/Servant280.jpg",
    "狄俄斯库里": "./src/img/heroes/Servant278.jpg",
    "奥德修斯": "./src/img/heroes/Servant277.jpg",
    "清少纳言": "./src/img/heroes/Servant276.jpg",
    "杨贵妃": "./src/img/heroes/Servant275.jpg",
    "欧罗巴": "./src/img/heroes/Servant274.jpg",
    "超人俄里翁": "./src/img/heroes/Servant272.jpg",
    "阿斯托尔福": "./src/img/heroes/Servant270.jpg",
    "太空伊什塔尔": "./src/img/heroes/Servant268.jpg",
    "阿尔托莉雅・潘德拉贡": "./src/img/heroes/Servant002.jpg",
    "宫本武藏": "./src/img/heroes/Servant153.jpg",
    "莱昂纳多・达・芬奇": "./src/img/heroes/Servant127.jpg",
    "织田信长": "./src/img/heroes/Servant250.jpg",
    "阿周那〔Alter〕": "./src/img/heroes/Servant247.jpg",
    "伟大的石像神": "./src/img/heroes/Servant244.jpg",
    "司马懿〔莱妮丝〕": "./src/img/heroes/Servant241.jpg",
    "BeastⅢ／L": "./src/img/heroes/Servant240.jpg",
    "Kingprotea": "./src/img/heroes/Servant238.jpg",
    "紫式部": "./src/img/heroes/Servant237.jpg",
    "李书文": "./src/img/heroes/Servant235.jpg",
    "红阎魔": "./src/img/heroes/Servant234.jpg",
    "布拉达曼特": "./src/img/heroes/Servant232.jpg",
    "始皇帝": "./src/img/heroes/Servant229.jpg",
    "项羽": "./src/img/heroes/Servant226.jpg",
    "志度内": "./src/img/heroes/Servant224.jpg",
    "BB": "./src/img/heroes/Servant220.jpg",
    "贞德": "./src/img/heroes/Servant059.jpg",
    "齐格鲁德": "./src/img/heroes/Servant213.jpg",
    "拿破仑": "./src/img/heroes/Servant212.jpg",
    "阿喀琉斯": "./src/img/heroes/Servant206.jpg",
    "伊凡雷帝": "./src/img/heroes/Servant205.jpg",
    "阿纳斯塔西娅": "./src/img/heroes/Servant201.jpg",
    "塞弥拉弥斯": "./src/img/heroes/Servant199.jpg",
    "葛饰北斋": "./src/img/heroes/Servant198.jpg",
    "埃列什基伽勒": "./src/img/heroes/Servant196.jpg",
    "阿比盖尔・威廉姆斯": "./src/img/heroes/Servant195.jpg",
    "刑部姬": "./src/img/heroes/Servant189.jpg",
    "阿尔托莉雅・潘德拉贡〔Alter〕": "./src/img/heroes/Servant179.jpg",
    "尼禄・克劳狄乌斯": "./src/img/heroes/Servant175.jpg",
    "夏洛克・福尔摩斯": "./src/img/heroes/Servant173.jpg",
    "不夜城的Caster": "./src/img/heroes/Servant169.jpg",
    "BeastⅢ／R": "./src/img/heroes/Servant168.jpg",
    "Meltryllis": "./src/img/heroes/Servant163.jpg",
    "土方岁三": "./src/img/heroes/Servant161.jpg",
    "亚瑟・潘德拉贡〔Prototype〕": "./src/img/heroes/Servant160.jpg",
    "新宿的Archer": "./src/img/heroes/Servant156.jpg",
    "谜之女主角X〔Alter〕": "./src/img/heroes/Servant155.jpg",
    "“山中老人”": "./src/img/heroes/Servant154.jpg",
    "所罗门": "./src/img/heroes/Servant083.jpg",
    "盖提亚": "./src/img/heroes/Servant151.jpg",
    "梅林": "./src/img/heroes/Servant150.jpg",
    "提亚马特": "./src/img/heroes/Servant149.jpg",
    "魁札尔・科亚特尔": "./src/img/heroes/Servant144.jpg",
    "恩奇都": "./src/img/heroes/Servant143.jpg",
    "伊什塔尔": "./src/img/heroes/Servant142.jpg",
    "克娄巴特拉": "./src/img/heroes/Servant139.jpg",
    "伊莉雅丝菲尔・冯・爱因兹贝伦": "./src/img/heroes/Servant136.jpg",
    "玉藻前": "./src/img/heroes/Servant062.jpg",
    "奥斯曼狄斯": "./src/img/heroes/Servant118.jpg",
    "源赖光": "./src/img/heroes/Servant114.jpg",
    "玄奘三藏": "./src/img/heroes/Servant113.jpg",
    "酒吞童子": "./src/img/heroes/Servant112.jpg",
    "伊斯坎达尔": "./src/img/heroes/Servant108.jpg",
    "贞德〔Alter〕": "./src/img/heroes/Servant106.jpg",
    "女王梅芙": "./src/img/heroes/Servant099.jpg",
    "库・丘林〔Alter〕": "./src/img/heroes/Servant098.jpg",
    "南丁格尔": "./src/img/heroes/Servant097.jpg",
    "岩窟王": "./src/img/heroes/Servant096.jpg",
    "天草四郎": "./src/img/heroes/Servant093.jpg",
    "两仪式": "./src/img/heroes/Servant091.jpg",
    "尼禄・克劳狄乌斯〔新娘〕": "./src/img/heroes/Servant090.jpg",
    "布伦希尔德": "./src/img/heroes/Servant088.jpg",
    "谜之女主角X": "./src/img/heroes/Servant086.jpg",
    "迦尔纳": "./src/img/heroes/Servant085.jpg",
    "阿周那": "./src/img/heroes/Servant084.jpg",
    "尼古拉・特斯拉": "./src/img/heroes/Servant077.jpg",
    "莫德雷德": "./src/img/heroes/Servant076.jpg",
    "开膛手杰克": "./src/img/heroes/Servant075.jpg",
    "斯卡哈": "./src/img/heroes/Servant070.jpg",
    "冲田总司": "./src/img/heroes/Servant068.jpg",
    "弗朗西斯・德雷克": "./src/img/heroes/Servant065.jpg",
    "俄里翁": "./src/img/heroes/Servant060.jpg",
    "弗拉德三世": "./src/img/heroes/Servant052.jpg",
    "坂田金时": "./src/img/heroes/Servant051.jpg",
    "诸葛孔明〔埃尔梅罗Ⅱ世〕": "./src/img/heroes/Servant037.jpg",
    "吉尔伽美什": "./src/img/heroes/Servant012.jpg",
    "阿蒂拉": "./src/img/heroes/Servant008.jpg"
}

const aliasList = {
    "安德洛墨达": [

    ],
    "源赖光／丑御前": [

    ],
    "日本武尊": [

    ],
    "上杉谦信": [

    ],
    "武田晴信": [

    ],
    "托勒密": [

    ],
    "旺吉娜": [

    ],
    "梅柳齐娜": [

    ],
    "阿尔托莉雅・卡斯特": [

    ],
    "雨之魔女梣": [

    ],
    "美杜莎": [
        'r姐'
    ],
    "杜尔伽": [

    ],
    "怖军": [

    ],
    "果心居士": [

    ],
    "所多玛之兽／德拉科": [

    ],
    "幼体／提亚马特": [

    ],
    "高杉晋作": [

    ],
    "女教皇若安": [

    ],
    "库库尔坎": [

    ],
    "特斯卡特利波卡": [

    ],
    "尼托克丽丝〔Alter〕": [

    ],
    "格里戈里・拉斯普京": [

    ],
    "布里托玛特": [

    ],
    "呼延灼": [

    ],
    "千利休": [

    ],
    "斯卡哈・斯卡蒂": [
        'cba'
    ],
    "伊吹童子": [

    ],
    "阿瓦隆女士": [
        '梅利'
    ],
    "Archetype：Earth": [
        '公主'
    ],
    "源为朝": [

    ],
    "曲亭马琴": [

    ],
    "詹姆斯・莫里亚蒂": [

    ],
    "查理曼": [

    ],
    "君士坦丁十一世": [

    ],
    "超级班扬": [

    ],
    "征氏姐妹": [

    ],
    "马纳南・麦克・利尔〔巴泽特〕": [

    ],
    "暗之高扬斯卡娅": [

    ],
    "BeastⅣ": [

    ],
    "太公望": [

    ],
    "坂本龙马": [

    ],
    "出云阿国": [

    ],
    "雅克・德・莫莱": [

    ],
    "迦摩": [

    ],
    "冲田总司〔Alter〕": [

    ],
    "奥伯龙": [
        '杀狐'
    ],
    "光之高扬斯卡娅": [

    ],
    "妖精骑士兰斯洛特": [

    ],
    "摩根": [

    ],
    "克莱恩小姐": [

    ],
    "伽拉忒亚": [

    ],
    "阿摩耳〔卡莲〕": [

    ],
    "平景清": [

    ],
    "千子村正": [

    ],
    "弗栗多": [

    ],
    "芦屋道满": [

    ],
    "尼莫": [

    ],
    "梵高": [

    ],
    "卑弥呼": [

    ],
    "阿比盖尔・威廉姆斯〔夏〕": [

    ],
    "杀生院祈荒": [

    ],
    "旅行者": [

    ],
    "罗穆路斯・奎里努斯": [

    ],
    "狄俄斯库里": [

    ],
    "奥德修斯": [

    ],
    "清少纳言": [

    ],
    "杨贵妃": [

    ],
    "欧罗巴": [

    ],
    "超人俄里翁": [

    ],
    "阿斯托尔福": [
        '阿福',
        'fa真女主'
    ],
    "太空伊什塔尔": [

    ],
    "阿尔托莉雅・潘德拉贡": [
        '呆毛王'
    ],
    "宫本武藏": [

    ],
    "莱昂纳多・达・芬奇": [
        '大碧池',
        '大碧池酱',
        '碧池a梦'
    ],
    "织田信长": [
        '信长',
        'nobu',
        '钉宫',
        '型月钉宫病原菌',
        '第六天萌王',
        'luo体披风',
        '裸体披风'
    ],
    "阿周那〔Alter〕": [

    ],
    "伟大的石像神": [

    ],
    "司马懿〔莱妮丝〕": [

    ],
    "BeastⅢ／L": [

    ],
    "Kingprotea": [

    ],
    "紫式部": [

    ],
    "李书文": [

    ],
    "红阎魔": [

    ],
    "布拉达曼特": [

    ],
    "始皇帝": [

    ],
    "项羽": [

    ],
    "志度内": [

    ],
    "BB": [

    ],
    "贞德": [
        '村姑',
        '尺子',
        '贞日天',
        '法国民心'
    ],
    "齐格鲁德": [

    ],
    "拿破仑": [

    ],
    "阿喀琉斯": [

    ],
    "伊凡雷帝": [

    ],
    "阿纳斯塔西娅": [

    ],
    "塞弥拉弥斯": [

    ],
    "葛饰北斋": [

    ],
    "埃列什基伽勒": [

    ],
    "阿比盖尔・威廉姆斯": [

    ],
    "刑部姬": [

    ],
    "阿尔托莉雅・潘德拉贡〔Alter〕": [
        '黑呆'
    ],
    "尼禄・克劳狄乌斯": [
        '暴君',
        '尼禄',
        '红saber'
    ],
    "夏洛克・福尔摩斯": [

    ],
    "不夜城的Caster": [

    ],
    "BeastⅢ／R": [

    ],
    "Meltryllis": [

    ],
    "土方岁三": [

    ],
    "亚瑟・潘德拉贡〔Prototype〕": [

    ],
    "新宿的Archer": [

    ],
    "谜之女主角X〔Alter〕": [

    ],
    "“山中老人”": [

    ],
    "所罗门": [
        'poi',
        '小便王'
    ],
    "盖提亚": [

    ],
    "梅林": [
        '变态'
    ],
    "提亚马特": [

    ],
    "魁札尔・科亚特尔": [

    ],
    "恩奇都": [

    ],
    "伊什塔尔": [

    ],
    "克娄巴特拉": [

    ],
    "伊莉雅丝菲尔・冯・爱因兹贝伦": [
        '伊莉雅'
    ],
    "玉藻前": [
        '小玉',
        'c玉',
        'c狐'
    ],
    "奥斯曼狄斯": [

    ],
    "源赖光": [
        '奶光妈妈',
        '奶光'
    ],
    "玄奘三藏": [
        '三藏',
        '女子高僧',
        'jk高僧',
        '说教',
        '替身使者',
        '打拳三人组'
    ],
    "酒吞童子": [
        '酒吞',
        'umb',
        '凹酱',
        '西瓜'

    ],
    "伊斯坎达尔": [
        '大帝'
    ],
    "贞德〔Alter〕": [

    ],
    "女王梅芙": [
        '梅芙',
        '妹夫',
        '碧池',
        '老司机',
        '狗控',
        '梅芙暖暖'
    ],
    "库・丘林〔Alter〕": [

    ],
    "南丁格尔": [
        '南丁',
        '蔻蔻',
        '护士'
    ],
    "岩窟王": [

    ],
    "天草四郎": [

    ],
    "两仪式": [

    ],
    "尼禄・克劳狄乌斯〔新娘〕": [
        '嫁王',
        '嫁尼禄',
        '白色暴君',
        '花嫁'
    ],
    "布伦希尔德": [
        '布姐(蓝)',
        '病娇枪',
        '笑什么笑，你也是西格鲁特',
        '西嫂',
        '飞嫂',
        ''
    ],
    "谜之女主角X": [
        'x毛',
        '杀手',
        '桐子',
        '星爆弃疗斩',
        '插拔',
        '六星特效'
    ],
    "迦尔纳": [
        '小太阳',
        '阿三(白)',
        'launcher',
        '真英雄',
        '大兄'
    ],
    "阿周那": [
        'jojo那',
        'jojo',
        '周周那',
        '阿三(黑)',
        '滑稽那',
        '娜娜子',
        '周黑鸭',
        '阿囧',
        '阿囧那',
        '倒射弓'
    ],
    "尼古拉・特斯拉": [
        '祖爷爷',
        '特总'
    ],
    "莫德雷德": [
        '小莫',
        '莫受',
        '熊孩子',
        '坑爹剑',
        '逆子',
        '父控'
    ],
    "开膛手杰克": [

    ],
    "斯卡哈": [
        '师匠',
        '西秀'
    ],
    "冲田总司": [
        '樱saber',
        '总司',
        '冲田',
        '对斯卡哈人型宝具',
        'saber(assassin)',
        '病弱'
    ],
    "弗朗西斯・德雷克": [
        '船长',
        '德姐'
    ],
    "俄里翁": [

    ],
    "弗拉德三世": [
        '大公',
        '穿刺公',
        '刺绣公',
        '四星枪兵',
        '五星之耻'
    ],
    "坂田金时": [
        '金时',
        '狗蛋',
        '金良辰',
        '金爸爸',
        'r金时',
        '暴走族',
        '假面骑士金时',
        '秋名山车神'
    ],
    "诸葛孔明〔埃尔梅罗Ⅱ世〕": [
        '王妃',
        '孔日天',
        '六星',
        '村夫',
        '老虚亲儿子'
    ],
    "吉尔伽美什": [
        '金闪闪',
        'C闪',
        '闪闪',
        '二闪',
        '金皮卡',
        '路灯王',
        '水枪王',
        'aup'
    ],
    "阿蒂拉": [
        '大王'
    ]
}