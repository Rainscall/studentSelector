"use strict"
const apiEndpoint = 'https://backend.fgopy.com';
let selectedCharacter = [];
let netCache = {
    respondCache: null,
    pageCache: [],
    lastStartsFrom: 0,
    picList: null,
    aliasList: null
};
let sortByCache = '';
const stepLength = 25;

const i18nAssets = {
    'zh-CN': {
        'homePage': {
            'coins': '圣晶石',
            'coinsPlaceholder': '大于等于',
            'search': '搜索',
            'searchPlaceholder': '名称或外号 (逗号分隔多个)',
            'servantList': '英灵列表'
        },
        'toast': {
            'sqlInject': '非法输入',
            'querying': '正在查询',
            'searchNotFound': '未找到符合条件的项目',
            'searchResultCount': '条被找到',
            'zeroSelected': '至少需要选择一个英灵',
            'selectedServant': '已选择以下英灵',
            'noPrev': '到顶了',
            'noNext': '到底了',
            'cleared': '清除完成',
            'redirectedTo': '重定向至：',
            'failedToQuery': '请求失败'
        },
        'toolbar': {
            'back': '返回',
            'search': '查询',
            'top': '顶部',
            'clear': '清空',
            'sort': '排序'
        },
        'searchResult': {
            'id': '编号',
            'tickets': '呼符',
            'coins': '圣晶石',
            'things': '英灵',
            'buy': '购买',
            'infoCopied': '订单信息已复制，请发送给客服',
            'copiedText': '我选择的ID为：',
            'counterTip': '代表该英灵的数量为'
        },
        'sortMenu': {
            'title': '排序方法',
            'coins': '圣晶石',
            'tickets': '呼符',
            'id': '编号'
        },
        'others': {
            'copied': '已复制',
            'confirm': '确定',
            'consoleWarnMessage': '请不要在此运行任何你不能理解的代码，否则将使你的信息陷入危险之中'
        }
    },
    'en-US': {
        'homePage': {
            'coins': 'Saint Quartz',
            'coinsPlaceholder': 'more than',
            'search': 'search',
            'searchPlaceholder': 'name or alias (use comma to split)',
            'servantList': 'servant list'
        },
        'toast': {
            'sqlInject': 'Invalid input',
            'querying': 'Querying',
            'searchNotFound': 'No matching items found',
            'searchResultCount': 'items found',
            'zeroSelected': 'At least one servant needs to be selected',
            'selectedServant': 'Selected servant',
            'noPrev': 'This is the first page',
            'noNext': 'This is the last page',
            'cleared': 'Cleared',
            'redirectedTo': 'Redirected to: ',
            'failedToQuery': 'Request failed:'
        },
        'toolbar': {
            'back': 'Back',
            'search': 'Search',
            'top': 'Top',
            'clear': 'Clear',
            'sort': 'Sort'
        },
        'searchResult': {
            'id': 'ID',
            'tickets': 'Summon Ticket',
            'coins': 'Saint Quartz',
            'things': 'Servant',
            'buy': 'Buy',
            'infoCopied': 'Order information has been copied, please send to sales representative',
            'copiedText': 'I would like to buy ID: ',
            'counterTip': 'The number of this Servant is: '
        },
        'sortMenu': {
            'title': 'Sort by...',
            'coins': 'Saint Quartz',
            'tickets': 'Summon Ticket',
            'id': 'ID'
        },
        'others': {
            'copied': 'Copied',
            'confirm': 'Confirm',
            'consoleWarnMessage': `Please don't run any code here that you don't understand, or you'll put your information at risk`
        }
    }
}

let languageAssets = {};
if (navigator.language.startsWith('zh')) {
    languageAssets = i18nAssets['zh-CN'];
} else {
    languageAssets = i18nAssets['en-US'];
}

function init() {
    removeElementsByClassName('tempElement');
    sortByCache = '';
    netCache.respondCache = '';
    infoArea.classList.add('shadowBorder');
    infoArea.innerHTML = '';
    const infoList = [
        [languageAssets.homePage.coins, languageAssets.homePage.coinsPlaceholder, 'number', 'coins', {
            'step': 1,
            'min': 1
        }],
        [languageAssets.homePage.search, languageAssets.homePage.searchPlaceholder, 'text', 'things', {
            'maxlength': '128'
        }]
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
                createToast(languageAssets.toast.sqlInject, 4300, '#FFF', '#840D23');
                return;
            }

            if (query === 'adminMode') {
                location.hash = 'admin';
                return;
            }

            createToast(languageAssets.toast.querying, -1, '#FFF', '#414141', 'temp-search-loadingToast');

            doSearch(query, infoList[i][3])
                .then(r => {
                    if (r == 'NOT FOUND') {
                        createToast(languageAssets.toast.searchNotFound, 4300, '#FFF', '#840D23');
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
        title.innerText = languageAssets.homePage.servantList;
        value.style.transform = 'translateY(-1px)';
        value.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M384 32c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H384zM160 144c-13.3 0-24 10.7-24 24s10.7 24 24 24h94.1L119 327c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l135-135V328c0 13.3 10.7 24 24 24s24-10.7 24-24V168c0-13.3-10.7-24-24-24H160z"/></svg>';

        base.addEventListener('click', () => {
            openCharacterList();
        })

        base.appendChild(title);
        base.appendChild(value);
        infoArea.appendChild(base);
    })();

    (async () => {
        if (selectedCharacter.length > 0) {
            infoArea.appendChild(document.createElement('hr'));
            let base = document.createElement('div');
            let title = document.createElement('div');
            let titleText = document.createElement('span');
            let titleIcon = document.createElement('div');
            let value = document.createElement('div');

            base.classList.add('selectedCharacterList');
            titleText.innerText = languageAssets.toast.selectedServant;
            titleIcon.classList.add('inlineSvgIcon');
            titleIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>';
            title.appendChild(titleText);
            title.appendChild(titleIcon);

            let picList;
            if (netCache.picList == null) {
                picList = await fetch('src/json/picList.json').then(r => r.json());
                netCache.picList = picList;
            } else {
                picList = netCache.picList;
            }

            titleIcon.addEventListener('click', () => {
                if (selectedCharacter.length === 0) {
                    createToast(languageAssets.toast.zeroSelected, 2540, '#FFF', '#414141', 'temp-search-loadingToast');
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
                createToast('查询中', -1, '#FFF', '#414141', 'temp-search-loadingToast');
                doSearch(queryStr, 'things')
                    .then(r => {
                        if (r == 'NOT FOUND') {
                            createToast(languageAssets.toast.searchNotFound, 4300, '#FFF', '#840D23');
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

function initAdmin() {
    function init() {
        removeElementsByClassName('tempElement');
        infoArea.classList.add('shadowBorder');
        infoArea.innerHTML = '';
        const infoList = [
            ['访问密钥', 'token', 'text', '', {
                'id': 'accessTokenInput',
                'autocomplete': 'off'
            }],
            ['通过ID删除', 'id', 'number', 'delById', {
                'step': 1,
                'min': 1
            }]
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

                sendReq(query, infoList[i][3])
                    .then(r => {
                        switch (r) {
                            case 'ACCESS DECLINE':
                                createToast('密钥错误或权限不足', 4300, '#FFF', '#840D23');
                                break;
                            case 'NOT FOUND':
                                createToast(languageAssets.toast.searchNotFound, 4300, '#FFF', '#840D23');
                                break;
                            case 'SUCCESS':
                                createToast('执行成功');
                                input.value = '';
                                break;
                            case null: break;
                            default:
                                createToast('未知错误', 4300, '#FFF', '#840D23');
                                break;
                        }
                    });
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
            title.innerText = '添加数据';
            value.style.transform = 'translateY(-1px)';
            value.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>';

            base.addEventListener('click', openAddMenu);

            base.appendChild(title);
            base.appendChild(value);
            infoArea.appendChild(base);
        })();

        infoArea.appendChild(document.createElement('hr'));
        (() => {
            let base = document.createElement('div');
            let title = document.createElement('div');
            let value = document.createElement('div');
            let fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            base.classList.add('childPart');
            value.classList.add('inlineSvgIcon');
            title.innerText = '从表格导入';
            value.style.transform = 'translateY(-1px)';
            value.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 256V160H224v96H64zm0 64H224v96H64V320zm224 96V320H448v96H288zM448 256H288V160H448v96zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z"/></svg>';

            base.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', () => {
                handleImportFromXlsx(fileInput);
            });

            base.appendChild(title);
            base.appendChild(value);
            infoArea.appendChild(base);
        })();

        infoArea.appendChild(document.createElement('hr'));
        (() => {
            let base = document.createElement('div');
            let title = document.createElement('div');
            let value = document.createElement('div');
            base.classList.add('childPart');
            value.classList.add('inlineSvgIcon');
            title.innerText = '清空缓存';
            value.style.transform = 'translateY(-1px)';
            value.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M290.7 57.4L57.4 290.7c-25 25-25 65.5 0 90.5l80 80c12 12 28.3 18.7 45.3 18.7H288h9.4H512c17.7 0 32-14.3 32-32s-14.3-32-32-32H387.9L518.6 285.3c25-25 25-65.5 0-90.5L381.3 57.4c-25-25-65.5-25-90.5 0zM297.4 416H288l-105.4 0-80-80L227.3 211.3 364.7 348.7 297.4 416z"/></svg>';

            base.addEventListener('click', () => {
                sendReq('true', 'flushCache')
                    .then(r => {
                        switch (r) {
                            case 'ACCESS DECLINE':
                                createToast('密钥错误或权限不足', 4300, '#FFF', '#840D23');
                                break;
                            case 'NOT FOUND':
                                createToast(languageAssets.toast.searchNotFound, 4300, '#FFF', '#840D23');
                                break;
                            case 'SUCCESS':
                                createToast('执行成功');
                                input.value = '';
                                break;
                            case null: break;
                            default:
                                createToast('未知错误', 4300, '#FFF', '#840D23');
                                break;
                        }
                    });
            });

            base.appendChild(title);
            base.appendChild(value);
            infoArea.appendChild(base);
        })();

        infoArea.appendChild(document.createElement('hr'));
        (() => {
            let base = document.createElement('div');
            let title = document.createElement('div');
            let value = document.createElement('div');
            base.classList.add('childPart');
            value.classList.add('inlineSvgIcon');
            title.innerText = '返回主页';
            value.style.transform = 'translateY(-1px)';
            value.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg>';

            base.addEventListener('click', () => {
                location.hash = '';
            })

            base.appendChild(title);
            base.appendChild(value);
            infoArea.appendChild(base);
        })();

        if (localStorage.getItem('accessToken')) {
            accessTokenInput.value = localStorage.getItem('accessToken');
        }

        accessTokenInput.addEventListener('input', function () {
            localStorage.setItem('accessToken', accessTokenInput.value);
        });
    }
    init();

    async function sendReq(query = '1.1.1.1', type) {
        if (!type) {
            return null;
        }
        createToast('执行中', -1, '#FFF', '#414141', 'temp-search-loadingToast');
        try {
            const r = await fetch(`${apiEndpoint}/?${type}=${encodeURIComponent(query)}&accessToken=${accessTokenInput.value}`).then(r => r.json());
            removeElementsByClassName('temp-search-loadingToast', 500);

            return r.status;

        } catch (error) {
            removeElementsByClassName('temp-search-loadingToast');
            createToast(`请求失败\n${error}`, 4300, '#FFF', '#840D23');
        }
    }

    function openAddMenu() {
        let dialog = document.createElement('dialog');
        let base = document.createElement('div');
        let title = document.createElement('h2');
        let addContainer = document.createElement('div');
        let apply = document.createElement('div');

        const method = {
            '编号': {
                'name': 'id',
                'attribute': {
                    'type': 'number',
                    'autocomplete': 'off',
                    'placeholder': '数字',
                    'required': 'required',
                    'min': '1'
                }
            },
            '圣晶石': {
                'name': 'coins',
                'attribute': {
                    'type': 'number',
                    'autocomplete': 'off',
                    'placeholder': '数字',
                    'required': 'required',
                    'min': '1'
                }
            },
            '呼符': {
                'name': 'tickets',
                'attribute': {
                    'type': 'number',
                    'autocomplete': 'off',
                    'placeholder': '数字',
                    'required': 'required',
                    'min': '1'
                }
            },
            '英灵': {
                'name': 'things',
                'attribute': {
                    'type': 'text',
                    'autocomplete': 'off',
                    'placeholder': '字符串',
                    'required': 'required'
                }
            }
        }

        dialog.classList.add('sortDialog');
        dialog.classList.add('shadowBorder');
        base.classList.add('basePart');
        apply.classList.add('apply');
        addContainer.classList.add('selectorContainer');
        addContainer.classList.add('addContainer');

        for (let i = 0; i < Object.keys(method).length; i++) {
            let base = document.createElement('div');
            let option = document.createElement('input');
            option.type = Object.values(method)[i].attribute.type;

            for (let j = 0; j < Object.keys(Object.values(method)[i].attribute).length; j++) {
                option.setAttribute(Object.keys(Object.values(method)[i].attribute)[j], Object.values(Object.values(method)[i].attribute)[j])
            }

            let label = document.createElement('label');
            label.setAttribute('for', `temp-addDialog-${Object.values(method)[i].name}`);
            label.innerText = Object.keys(method)[i];
            label.dataset.value = Object.values(method)[i].name;

            option.id = `temp-addDialog-${Object.values(method)[i].name}`;
            option.name = 'addDialogInput';
            option.dataset.value = Object.values(method)[i].name;

            base.appendChild(label);
            base.appendChild(option);
            addContainer.appendChild(base);

            base.addEventListener('click', () => {
                option.focus();
            });
        }

        title.innerText = '添加数据';
        apply.innerText = '确定';

        apply.addEventListener('click', () => {
            const inputs = document.getElementsByName('addDialogInput');
            let subData = {};

            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i].value.length < 1) {
                    createToast('不予添加\n原因：存在空项', 4300, '#FFF', '#840D23');
                    dialog.close();
                    dialog.remove();
                    return;
                }

                if (inputs[i].type === 'number' && Number(inputs[i].value) < 0) {
                    createToast('不予添加\n原因：存在负数', 4300, '#FFF', '#840D23');
                    dialog.close();
                    dialog.remove();
                    return;
                }

                if (isPotentialSQLInjection(inputs[i].value) === true) {
                    createToast('不予添加\n原因：检查到SQL注入', 4300, '#FFF', '#840D23');
                    dialog.close();
                    dialog.remove();
                    return;
                }
                subData[inputs[i].dataset.value] = inputs[i].value;
            }

            sendReq(JSON.stringify(subData), 'add')
                .then(r => {
                    switch (r) {
                        case 'ACCESS DECLINE':
                            createToast('密钥错误或权限不足', 4300, '#FFF', '#840D23');
                            break;
                        case 'FOUND THE SAME ID':
                            createToast('添加失败\n原因：检测到ID重复', 4300, '#FFF', '#840D23');
                            break;
                        case 'SUCCESS':
                            createToast('执行成功');
                            break;
                        default:
                            createToast('未知错误', 4300, '#FFF', '#840D23');
                            break;
                    }
                });

            dialog.close();
            dialog.remove();
        });

        dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                dialog.close();
                dialog.remove();
            }
        });

        base.appendChild(title);
        base.appendChild(document.createElement('hr'));
        base.appendChild(addContainer);
        base.appendChild(document.createElement('hr'));
        base.appendChild(apply);
        dialog.appendChild(base);
        document.body.appendChild(dialog);
        dialog.showModal();
    }

    function handleImportFromXlsx(element) {
        const file = element.files[0];
        element.value = '';

        if (file.size > 4 * 1024 * 1024) {
            createToast('添加失败\n原因：文件超过4MiB', 4300, '#FFF', '#840D23');
            return;
        }

        if (file.name.split('.').pop().toLowerCase() !== 'xlsx') {
            createToast('添加失败\n原因：不是xlsx文件', 4300, '#FFF', '#840D23');
            return;
        }

        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const base64Data = e.target.result.split(',')[1]; // Extracting the Base64 data
                    const workbook = XLSX.read(atob(base64Data), { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const dataArray = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    let data = {
                        title: dataArray[0],
                        body: []
                    }

                    for (let i = 1; i < dataArray.length; i++) {
                        data.body[i - 1] = dataArray[i];
                    }

                    (async () => {
                        createToast('执行中', -1, '#FFF', '#414141', 'temp-search-loadingToast');
                        try {
                            const r = await fetch(`${apiEndpoint}/?massImport=true&accessToken=${accessTokenInput.value}`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': "application/json"
                                    },
                                    body: JSON.stringify(data)
                                })
                                .then(r => r.json());

                            switch (r.status) {
                                case 'ACCESS DECLINE':
                                    createToast('密钥错误或权限不足', 4300, '#FFF', '#840D23');
                                    break;
                                case 'FOUND THE SAME RECORD':
                                    createToast('添加失败\n原因：检测到重复的记录', 4300, '#FFF', '#840D23');
                                    break;
                                case 'SUCCESS':
                                    createToast('执行成功');
                                    break;
                                default:
                                    createToast('未知错误', 4300, '#FFF', '#840D23');
                                    break;
                            }
                            removeElementsByClassName('temp-search-loadingToast', 500);
                        } catch (error) {
                            removeElementsByClassName('temp-search-loadingToast');
                            createToast(`请求失败\n${error}`, 4300, '#FFF', '#840D23');
                        }
                    })();
                } catch (error) {
                    createToast(`发生错误：\n${error}`, 4300, '#FFF', '#840D23');
                    return;
                }
            };
            reader.readAsDataURL(file);
        } else {
            console.error('No file selected.');
        }
    }

}

//首次打开时判断hashtag
if (location.hash === '#admin') {
    initAdmin();
} else {
    init();
}

//监听hashtag变化
window.addEventListener('hashchange', function () {
    if (location.hash === '#admin') {
        initAdmin();

    } else {
        init();
    }
});


async function openCharacterList() {
    infoArea.classList.remove('shadowBorder');
    infoArea.innerHTML = '';

    (() => {
        function quickQuery() {
            if (selectedCharacter.length === 0) {
                createToast(languageAssets.toast.zeroSelected, 2540, '#FFF', '#414141', 'temp-search-loadingToast');
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
            createToast(languageAssets.toast.querying, -1, '#FFF', '#414141', 'temp-search-loadingToast');
            doSearch(queryStr, 'things')
                .then(r => {
                    if (r == 'NOT FOUND') {
                        createToast(languageAssets.toast.searchNotFound, 4300, '#FFF', '#840D23');
                    }
                });
        }

        const functionList = [
            {
                'name': languageAssets.toolbar.back,
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>',
                'callback': 'init'
            },
            {
                'name': languageAssets.toolbar.search,
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>',
                'callback': 'quickQuery'
            },
            {
                'name': languageAssets.toolbar.top,
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M246.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 109.3 361.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160zm160 352l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 301.3 361.4 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z"/></svg>',
                'callback': `(()=>{infoArea.children[0].scrollIntoView({behavior: "smooth"});})`
            },
            {
                'name': languageAssets.toolbar.clear,
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

    let picList;
    if (netCache.picList == null) {
        picList = await fetch('src/json/picList.json').then(r => r.json());
        netCache.picList = picList;
    } else {
        picList = netCache.picList;
    }

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

/**
 * 写入数据到infoArea
 * @param {json} r 
 * @param {String} sortOrder 
 * @param {String} sortBy 
 * @param {Number} maxPageSize 
 * @param {Number} startsFrom 
 * @returns 
 */
async function writeInfo(r, sortOrder = 'asc', sortBy = 'coins', maxPageSize = stepLength, startsFrom = 0) {
    if (startsFrom >= r.accounts.length) {
        createToast(languageAssets.toast.noNext);
        netCache.lastStartsFrom -= stepLength;
        return;
    }

    infoArea.classList.remove('shadowBorder');
    removeElementsByClassNameSync('tempElement');
    infoArea.innerHTML = '';
    (() => {
        const functionList = [
            {
                'name': languageAssets.toolbar.back,
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>',
                'callback': 'init'
            },
            {
                'name': languageAssets.toolbar.top,
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M246.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 109.3 361.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160zm160 352l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 301.3 361.4 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z"/></svg>',
                'callback': `(()=>{infoArea.children[0].scrollIntoView({behavior: "smooth"});
                })`
            },
            {
                'name': languageAssets.toolbar.sort,
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M151.6 42.4C145.5 35.8 137 32 128 32s-17.5 3.8-23.6 10.4l-88 96c-11.9 13-11.1 33.3 2 45.2s33.3 11.1 45.2-2L96 146.3V448c0 17.7 14.3 32 32 32s32-14.3 32-32V146.3l32.4 35.4c11.9 13 32.2 13.9 45.2 2s13.9-32.2 2-45.2l-88-96zM320 480h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H320c-17.7 0-32 14.3-32 32s14.3 32 32 32zm0-128h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H320c-17.7 0-32 14.3-32 32s14.3 32 32 32zm0-128H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H320c-17.7 0-32 14.3-32 32s14.3 32 32 32zm0-128H544c17.7 0 32-14.3 32-32s-14.3-32-32-32H320c-17.7 0-32 14.3-32 32s14.3 32 32 32z"/></svg>',
                'callback': 'openSortMenu'
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
    })();

    (() => {
        let blankDiv = document.createElement('div');
        blankDiv.style.height = '4.2rem';
        infoArea.appendChild(blankDiv);
    })();

    r.accounts = sortByItems(r.accounts, sortBy, sortOrder);
    netCache.pageCache = [];

    if (startsFrom + maxPageSize > r.accounts.length) {
        maxPageSize = r.accounts.length - startsFrom;
    }

    for (let i = startsFrom, j = 0; i < startsFrom + maxPageSize; i++, j++) {
        netCache.pageCache[j] = r.accounts[i];
    }

    for (let i = 0; i < maxPageSize; i++) {
        const infoList = netCache.pageCache[i];
        const infoArea = document.getElementById('infoArea');
        const container = document.createElement('div');
        container.classList.add('shadowBorder');
        container.classList.add('infoContainer');
        for (let i = 0; i < Object.keys(infoList).length; i++) {
            let currentValue = String(Object.values(infoList)[i]);
            const currentKey = Object.keys(infoList)[i];
            const displayKey = {
                'id': languageAssets.searchResult.id,
                'tickets': languageAssets.searchResult.tickets,
                'coins': languageAssets.searchResult.coins,
                'things': languageAssets.searchResult.things
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
                        displayValue += ',';
                    }
                }
            } else {
                displayValue = currentValue;
            }

            value.dataset.value = displayValue;

            let picList;
            if (netCache.picList == null) {
                picList = await fetch('src/json/picList.json').then(r => r.json());
                netCache.picList = picList;
            } else {
                picList = netCache.picList;
            }

            if (currentKey != 'things') {
                value.innerHTML = displayValue;
            }

            switch (currentKey) {
                case 'id': {
                    let button = document.createElement('div');
                    button.innerText = languageAssets.searchResult.buy;
                    value.classList.add('searchResultId');
                    value.appendChild(button);

                    base.addEventListener('click', () => {
                        const textArea = document.createElement('textArea')
                        textArea.value = `${languageAssets.searchResult.copiedText}${infoList.id}`;
                        textArea.style.width = 0
                        textArea.style.position = 'fixed'
                        textArea.style.left = '-999px'
                        textArea.style.top = '10px'
                        textArea.setAttribute('readonly', 'readonly')
                        document.body.appendChild(textArea)

                        textArea.select()
                        document.execCommand('copy')
                        document.body.removeChild(textArea)

                        createToast(`${languageAssets.searchResult.infoCopied}`, 1350);

                        setTimeout(() => {
                            if (/Android|iPhone|iPad|iPod|BlackBerry|webOS|Windows Phone|SymbianOS|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                                window.open('taobao://shop100392721.taobao.com/', '_blank');
                            } else {
                                window.open('https://market.m.taobao.com/app/im/chat/index.html?&uid=cntaobao%E9%98%BF%E8%8E%B9%E6%B7%98%E5%BA%97&gid=&type=web', '_blank');
                            }
                        }, 1350);
                    })

                    break;
                }
                case 'things': {
                    base.classList.add('heroList');
                    (() => {
                        let characterList = value.dataset.value.split(',');
                        let characterCounter = {};
                        let base = document.createElement('div');
                        let container = document.createElement('div');

                        base.classList.add('selectedCharacterList');

                        container.style.justifyContent = 'flex-start';

                        for (let i = 0; i < characterList.length; i++) {
                            if (!characterCounter[characterList[i]]) {
                                characterCounter[characterList[i]] = 1;
                            } else {
                                characterCounter[characterList[i]] += 1;
                            }
                        }

                        characterList = Object.keys(characterCounter);
                        for (let i = 0; i < characterList.length; i++) {
                            let base = document.createElement('div');
                            let span = document.createElement('span');
                            let counter = document.createElement('span');
                            span.innerText = characterList[i];

                            if (Object.values(characterCounter)[i] > 1) {
                                counter.innerText = `${Object.values(characterCounter)[i]}`;
                                counter.setAttribute('title', `${languageAssets.searchResult.counterTip}${Object.values(characterCounter)[i]}`);
                                span.appendChild(counter);
                            }

                            if (picList[characterList[i]]) {
                                let img = document.createElement('div');
                                img.classList.add('img');
                                img.style.backgroundImage = `url('${picList[characterList[i]]}')`;
                                base.appendChild(img);
                            } else {
                                span.style.marginLeft = '0';
                            }

                            base.appendChild(span);
                            container.appendChild(base);
                        }

                        base.appendChild(container);
                        value.appendChild(base);
                    })();
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

    if (netCache.respondCache.accounts.length > stepLength) {
        function changePage(action) {
            if (action === 'prev') {
                if (netCache.lastStartsFrom === 0) {
                    createToast(languageAssets.toast.noPrev);
                    return;
                }
                netCache.lastStartsFrom -= stepLength;
                writeInfo(netCache.respondCache, 'coins', 'desc', stepLength, netCache.lastStartsFrom);
            } else {
                netCache.lastStartsFrom += stepLength;
                writeInfo(netCache.respondCache, 'coins', 'desc', stepLength, netCache.lastStartsFrom);
            }
        }

        const infoArea = document.getElementById('infoArea');
        let switcher = document.createElement('div');
        let base = document.createElement('div');
        let functionList = {
            'prev': {
                'svgIcon': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"/></svg>',
                'callback': `(() => { changePage('prev') })`
            },
            'next': {
                'svgIcon': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>',
                'callback': `(() => { changePage('next') })`
            }
        };

        switcher.classList.add('infoContainer');
        switcher.classList.add('pageSwitcherBase');
        base.classList.add('pageSwitcher');
        base.classList.add('shadowBorder');

        function createArrow(action) {
            let icon = document.createElement('div');
            icon.classList.add('inlineSvgIcon');
            icon.classList.add('curPtr');
            icon.innerHTML = functionList[action].svgIcon;

            icon.addEventListener('click', eval(functionList[action].callback));
            base.appendChild(icon);
        }

        createArrow('prev');

        (() => {
            let icon = document.createElement('div');
            let from = document.createElement('span');
            let to = document.createElement('span');
            let toWord = document.createElement('span');

            icon.classList.add('curPtr');
            icon.classList.add('pageNumber');

            from.innerText = netCache.lastStartsFrom + 1;
            to.innerText = netCache.lastStartsFrom + netCache.pageCache.length;
            toWord.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M470.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 256 265.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160zm-352 160l160-160c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L210.7 256 73.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z"/></svg>';

            toWord.classList.add('inlineSvgIcon');

            icon.appendChild(from);
            icon.appendChild(toWord);
            icon.appendChild(to);


            base.appendChild(icon);
        })();

        createArrow('next');

        switcher.appendChild(base);
        infoArea.appendChild(switcher);
    }


    (() => {
        let blankDiv = document.createElement('div');
        blankDiv.style.height = '6rem';
        infoArea.appendChild(blankDiv);
    })();

    //平滑滑动到顶
    (() => { infoArea.children[0].scrollIntoView({ behavior: "smooth" }); })()
}

async function doSearch(query = '1.1.1.1', type) {
    try {
        if (query.indexOf('，') !== 0) {
            query = query.replace(/，/g, ',');//全角逗号替换成半角
        }
        if (query.indexOf(',') !== 0) {
            let showRedircted = false;
            let queryList = query.split(',');
            query = '';
            for (let i = 0; i < queryList.length; i++) {
                if (await aliasToName(queryList[i]) !== false) {
                    queryList[i] = await aliasToName(queryList[i]);
                    showRedircted = true;
                }
                query += queryList[i];
                if (i !== queryList.length - 1) {
                    query += ',';
                }
            }
            if (showRedircted) {
                createToast(`${languageAssets.toast.redirectedTo} ${query}`);
            }
        } else if (await aliasToName(query) !== false) {
            query = await aliasToName(query);
            createToast(`${languageAssets.toast.redirectedTo} ${query}`);
        }

        const r = await fetch(`${apiEndpoint}/?${type}=${encodeURIComponent(query)}`).then(r => r.json());
        removeElementsByClassName('temp-search-loadingToast', 500);
        if (r.status === 'NOT FOUND') {
            return 'NOT FOUND';
        }

        netCache.respondCache = r;
        netCache.lastStartsFrom = 0;
        sortByCache = 'coins';
        createToast(`${netCache.respondCache.accounts.length} ${languageAssets.toast.searchResultCount}`);

        if (type === 'coins') {
            writeInfo(r);
        } else {
            writeInfo(r, 'desc');
        }

    } catch (error) {
        removeElementsByClassName('temp-search-loadingToast');
        createToast(`${languageAssets.toast.failedToQuery}\n${error}`, 4300, '#FFF', '#840D23');
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

function removeElementsByClassNameSync(className) {
    let ele = document.getElementsByClassName(className);
    for (let i = 0; i < ele.length; i++) {
        ele[i].parentNode.removeChild(ele[i]);
    }
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
    createToast(languageAssets.toast.cleared, 2640);
}

function getAverageRGB(imgEl) {

    let blockSize = 5,
        // only visit every 5 pixels
        defaultRGB = {
            r: 255,
            g: 255,
            b: 255
        },
        // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d', {
            willReadFrequently: true,
            alpha: false
        }),

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

/**
 * 根据外号查找对应大名
 * @param {String} input 
 * @returns 
 */
async function aliasToName(input) {
    input = input.toLowerCase();
    let aliasList;

    if (netCache.aliasList == null) {
        aliasList = await fetch('src/json/aliasList.json').then(r => r.json());
        netCache.aliasList = aliasList;
    } else {
        aliasList = netCache.aliasList;
    }

    for (let i = 0; i < Object.keys(aliasList).length; i++) {
        if (Object.values(aliasList)[i].includes(input)) {
            return Object.keys(aliasList)[i];
        }
    }
    return false;
}

/**
 * 对json对象进行排序
 * @param {json} jsonArray 
 * @param {String} orderBy 
 * @param {string} sortOrder 
 * @returns 排序后的json
 */
function sortByItems(jsonArray, orderBy, sortOrder = 'asc') {
    const orderMultiplier = (sortOrder === 'desc') ? -1 : 1;
    jsonArray.sort((a, b) => (a[orderBy] - b[orderBy]) * orderMultiplier);
    return jsonArray;
}

/**
 * 打开排序模态框
 */
function openSortMenu() {
    let dialog = document.createElement('dialog');
    let base = document.createElement('div');
    let title = document.createElement('h2');
    let selectorContainer = document.createElement('div');
    let apply = document.createElement('div');

    const method = {
        '圣晶石': 'coins',
        '呼符': 'tickets',
        '编号': 'id'
    }

    dialog.classList.add('sortDialog');
    dialog.classList.add('shadowBorder');
    base.classList.add('basePart');
    apply.classList.add('apply');
    selectorContainer.classList.add('selectorContainer')

    for (let i = 0; i < Object.keys(method).length; i++) {
        let base = document.createElement('div');
        let option = document.createElement('input');
        option.type = 'radio';
        let label = document.createElement('label');
        label.setAttribute('for', `temp-sortSelector-${Object.keys(method)[i]}`);
        label.innerText = languageAssets.sortMenu[Object.values(method)[i]];
        label.dataset.value = Object.keys(method)[i];

        option.id = `temp-sortSelector-${Object.keys(method)[i]}`;
        option.value = Object.values(method)[i];
        option.innerText = Object.keys(method)[i];
        option.name = 'sortSelector';
        base.appendChild(option);
        base.appendChild(label);
        selectorContainer.appendChild(base);

        base.addEventListener('click', () => {
            for (let j = 0; j < Object.keys(method).length; j++) {
                try {
                    selectorContainer.children[j].classList.remove('selected');
                } catch (error) {
                    continue;
                }
            }
            base.classList.add('selected');
            base.children[1].click();
        });
    }

    if (!sortByCache) {
        selectorContainer.children[0].click();
    } else {
        for (let i = 0; i < selectorContainer.children.length; i++) {
            if (method[selectorContainer.children[i].children[1].dataset.value] === sortByCache) {
                selectorContainer.children[i].click();
            }
        }
    }

    title.innerText = languageAssets.sortMenu.title;
    apply.innerText = languageAssets.others.confirm;

    apply.addEventListener('click', () => {
        let selected = method[document.querySelector('.selectorContainer>.selected>label').dataset.value];
        if (sortByCache != selected) {
            sortByCache = selected;
            netCache.lastStartsFrom = 0;
            writeInfo(netCache.respondCache, 'desc', selected);
        }
        dialog.close();
        dialog.remove();
    });

    base.appendChild(title);
    base.appendChild(document.createElement('hr'));
    base.appendChild(selectorContainer);
    base.appendChild(apply);
    dialog.appendChild(base);
    document.body.appendChild(dialog);
    dialog.showModal();
}

console.log(`%c ${languageAssets.others.consoleWarnMessage}`, 'color: red; font-size: xx-large; font-family: Arial, Helvetica, sans-serif; background-color: yellow;');