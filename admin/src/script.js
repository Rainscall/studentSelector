"use strict"
const apiEndpoint = 'https://backend.fgopy.com';

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

            doSearch(query, infoList[i][3])
                .then(r => {
                    switch (r) {
                        case 'ACCESS DECLINE':
                            createToast('密钥错误或权限不足', 4300, '#FFF', '#840D23');
                            break;
                        case 'NOT FOUND':
                            createToast('未找到符合条件的项目', 4300, '#FFF', '#840D23');
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

    if (localStorage.getItem('accessToken')) {
        accessTokenInput.value = localStorage.getItem('accessToken');
    }

    accessTokenInput.addEventListener('input', function () {
        localStorage.setItem('accessToken', accessTokenInput.value);
    });
}
init();

async function doSearch(query = '1.1.1.1', type) {
    if (!type) {
        return null;
    }
    createToast('正在执行', -1, '#FFF', '#414141', 'temp-search-loadingToast');
    try {
        const r = await fetch(`${apiEndpoint}/?${type}=${encodeURIComponent(query)}&accessToken=${accessTokenInput.value}`).then(r => r.json());
        removeElementsByClassName('temp-search-loadingToast', 500);

        return r.status;

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

const picList = {
    "阿尔托莉雅・卡斯特": "/src/img/heroes/Servant284.jpg",
    "雨之魔女梣": "/src/img/heroes/Servant385.jpg",
    "阿瓦隆女士": "/src/img/heroes/Servant353.jpg",
    "Archetype：Earth": "/src/img/heroes/Servant351.jpg",
    "奥伯龙": "/src/img/heroes/Servant316.jpg",
    "光之高扬斯卡娅": "/src/img/heroes/Servant314.jpg",
    "妖精骑士兰斯洛特": "/src/img/heroes/Servant312.jpg",
    "摩根": "/src/img/heroes/Servant309.jpg",
    "梅林": "/src/img/heroes/Servant150.jpg",
    "诸葛孔明〔埃尔梅罗Ⅱ世〕": "/src/img/heroes/Servant037.jpg",
    "安德洛墨达": "/src/img/heroes/Servant406.jpg",
    "源赖光／丑御前": "/src/img/heroes/Servant403.jpg",
    "日本武尊": "/src/img/heroes/Servant402.jpg",
    "上杉谦信": "/src/img/heroes/Servant400.jpg",
    "武田晴信": "/src/img/heroes/Servant397.jpg",
    "托勒密": "/src/img/heroes/Servant394.jpg",
    "旺吉娜": "/src/img/heroes/Servant393.jpg",
    "梅柳齐娜": "/src/img/heroes/Servant390.jpg",
    "美杜莎": "/src/img/heroes/Servant384.jpg",
    "杜尔伽": "/src/img/heroes/Servant383.jpg",
    "怖军": "/src/img/heroes/Servant381.jpg",
    "果心居士": "/src/img/heroes/Servant380.jpg",
    "所多玛之兽／德拉科": "/src/img/heroes/Servant377.jpg",
    "幼体／提亚马特": "/src/img/heroes/Servant376.jpg",
    "高杉晋作": "/src/img/heroes/Servant375.jpg",
    "女教皇若安": "/src/img/heroes/Servant374.jpg",
    "库库尔坎": "/src/img/heroes/Servant373.jpg",
    "特斯卡特利波卡": "/src/img/heroes/Servant371.jpg",
    "尼托克丽丝〔Alter〕": "/src/img/heroes/Servant370.jpg",
    "格里戈里・拉斯普京": "/src/img/heroes/Servant369.jpg",
    "布里托玛特": "/src/img/heroes/Servant368.jpg",
    "呼延灼": "/src/img/heroes/Servant365.jpg",
    "千利休": "/src/img/heroes/Servant362.jpg",
    "斯卡哈・斯卡蒂": "/src/img/heroes/Servant215.jpg",
    "伊吹童子": "/src/img/heroes/Servant299.jpg",
    "源为朝": "/src/img/heroes/Servant350.jpg",
    "曲亭马琴": "/src/img/heroes/Servant349.jpg",
    "詹姆斯・莫里亚蒂": "/src/img/heroes/Servant346.jpg",
    "查理曼": "/src/img/heroes/Servant343.jpg",
    "君士坦丁十一世": "/src/img/heroes/Servant342.jpg",
    "超级班扬": "/src/img/heroes/Servant339.jpg",
    "征氏姐妹": "/src/img/heroes/Servant337.jpg",
    "马纳南・麦克・利尔〔巴泽特〕": "/src/img/heroes/Servant336.jpg",
    "暗之高扬斯卡娅": "/src/img/heroes/Servant334.jpg",
    "BeastⅣ": "/src/img/heroes/Servant333.jpg",
    "太公望": "/src/img/heroes/Servant331.jpg",
    "坂本龙马": "/src/img/heroes/Servant329.jpg",
    "出云阿国": "/src/img/heroes/Servant327.jpg",
    "雅克・德・莫莱": "/src/img/heroes/Servant324.jpg",
    "迦摩": "/src/img/heroes/Servant239.jpg",
    "冲田总司〔Alter〕": "/src/img/heroes/Servant209.jpg",
    "克莱恩小姐": "/src/img/heroes/Servant307.jpg",
    "伽拉忒亚": "/src/img/heroes/Servant306.jpg",
    "阿摩耳〔卡莲〕": "/src/img/heroes/Servant305.jpg",
    "平景清": "/src/img/heroes/Servant303.jpg",
    "千子村正": "/src/img/heroes/Servant302.jpg",
    "弗栗多": "/src/img/heroes/Servant300.jpg",
    "芦屋道满": "/src/img/heroes/Servant297.jpg",
    "尼莫": "/src/img/heroes/Servant296.jpg",
    "梵高": "/src/img/heroes/Servant295.jpg",
    "卑弥呼": "/src/img/heroes/Servant292.jpg",
    "阿比盖尔・威廉姆斯〔夏〕": "/src/img/heroes/Servant289.jpg",
    "杀生院祈荒": "/src/img/heroes/Servant167.jpg",
    "旅行者": "/src/img/heroes/Servant281.jpg",
    "罗穆路斯・奎里努斯": "/src/img/heroes/Servant280.jpg",
    "狄俄斯库里": "/src/img/heroes/Servant278.jpg",
    "奥德修斯": "/src/img/heroes/Servant277.jpg",
    "清少纳言": "/src/img/heroes/Servant276.jpg",
    "杨贵妃": "/src/img/heroes/Servant275.jpg",
    "欧罗巴": "/src/img/heroes/Servant274.jpg",
    "超人俄里翁": "/src/img/heroes/Servant272.jpg",
    "阿斯托尔福": "/src/img/heroes/Servant270.jpg",
    "太空伊什塔尔": "/src/img/heroes/Servant268.jpg",
    "阿尔托莉雅・潘德拉贡": "/src/img/heroes/Servant002.jpg",
    "宫本武藏": "/src/img/heroes/Servant153.jpg",
    "莱昂纳多・达・芬奇": "/src/img/heroes/Servant127.jpg",
    "织田信长": "/src/img/heroes/Servant250.jpg",
    "阿周那〔Alter〕": "/src/img/heroes/Servant247.jpg",
    "伟大的石像神": "/src/img/heroes/Servant244.jpg",
    "司马懿〔莱妮丝〕": "/src/img/heroes/Servant241.jpg",
    "BeastⅢ／L": "/src/img/heroes/Servant240.jpg",
    "Kingprotea": "/src/img/heroes/Servant238.jpg",
    "紫式部": "/src/img/heroes/Servant237.jpg",
    "李书文": "/src/img/heroes/Servant235.jpg",
    "红阎魔": "/src/img/heroes/Servant234.jpg",
    "布拉达曼特": "/src/img/heroes/Servant232.jpg",
    "始皇帝": "/src/img/heroes/Servant229.jpg",
    "项羽": "/src/img/heroes/Servant226.jpg",
    "志度内": "/src/img/heroes/Servant224.jpg",
    "BB": "/src/img/heroes/Servant220.jpg",
    "贞德": "/src/img/heroes/Servant059.jpg",
    "齐格鲁德": "/src/img/heroes/Servant213.jpg",
    "拿破仑": "/src/img/heroes/Servant212.jpg",
    "阿喀琉斯": "/src/img/heroes/Servant206.jpg",
    "伊凡雷帝": "/src/img/heroes/Servant205.jpg",
    "阿纳斯塔西娅": "/src/img/heroes/Servant201.jpg",
    "塞弥拉弥斯": "/src/img/heroes/Servant199.jpg",
    "葛饰北斋": "/src/img/heroes/Servant198.jpg",
    "埃列什基伽勒": "/src/img/heroes/Servant196.jpg",
    "阿比盖尔・威廉姆斯": "/src/img/heroes/Servant195.jpg",
    "刑部姬": "/src/img/heroes/Servant189.jpg",
    "阿尔托莉雅・潘德拉贡〔Alter〕": "/src/img/heroes/Servant179.jpg",
    "尼禄・克劳狄乌斯": "/src/img/heroes/Servant175.jpg",
    "夏洛克・福尔摩斯": "/src/img/heroes/Servant173.jpg",
    "不夜城的Caster": "/src/img/heroes/Servant169.jpg",
    "BeastⅢ／R": "/src/img/heroes/Servant168.jpg",
    "Meltryllis": "/src/img/heroes/Servant163.jpg",
    "土方岁三": "/src/img/heroes/Servant161.jpg",
    "亚瑟・潘德拉贡〔Prototype〕": "/src/img/heroes/Servant160.jpg",
    "新宿的Archer": "/src/img/heroes/Servant156.jpg",
    "谜之女主角X〔Alter〕": "/src/img/heroes/Servant155.jpg",
    "“山中老人”": "/src/img/heroes/Servant154.jpg",
    "所罗门": "/src/img/heroes/Servant083.jpg",
    "盖提亚": "/src/img/heroes/Servant151.jpg",
    "提亚马特": "/src/img/heroes/Servant149.jpg",
    "魁札尔・科亚特尔": "/src/img/heroes/Servant144.jpg",
    "恩奇都": "/src/img/heroes/Servant143.jpg",
    "伊什塔尔": "/src/img/heroes/Servant142.jpg",
    "克娄巴特拉": "/src/img/heroes/Servant139.jpg",
    "伊莉雅丝菲尔・冯・爱因兹贝伦": "/src/img/heroes/Servant136.jpg",
    "玉藻前": "/src/img/heroes/Servant062.jpg",
    "奥斯曼狄斯": "/src/img/heroes/Servant118.jpg",
    "源赖光": "/src/img/heroes/Servant114.jpg",
    "玄奘三藏": "/src/img/heroes/Servant113.jpg",
    "酒吞童子": "/src/img/heroes/Servant112.jpg",
    "伊斯坎达尔": "/src/img/heroes/Servant108.jpg",
    "贞德〔Alter〕": "/src/img/heroes/Servant106.jpg",
    "女王梅芙": "/src/img/heroes/Servant099.jpg",
    "库・丘林〔Alter〕": "/src/img/heroes/Servant098.jpg",
    "南丁格尔": "/src/img/heroes/Servant097.jpg",
    "岩窟王": "/src/img/heroes/Servant096.jpg",
    "天草四郎": "/src/img/heroes/Servant093.jpg",
    "两仪式": "/src/img/heroes/Servant091.jpg",
    "尼禄・克劳狄乌斯〔新娘〕": "/src/img/heroes/Servant090.jpg",
    "布伦希尔德": "/src/img/heroes/Servant088.jpg",
    "谜之女主角X": "/src/img/heroes/Servant086.jpg",
    "迦尔纳": "/src/img/heroes/Servant085.jpg",
    "阿周那": "/src/img/heroes/Servant084.jpg",
    "尼古拉・特斯拉": "/src/img/heroes/Servant077.jpg",
    "莫德雷德": "/src/img/heroes/Servant076.jpg",
    "开膛手杰克": "/src/img/heroes/Servant075.jpg",
    "斯卡哈": "/src/img/heroes/Servant070.jpg",
    "冲田总司": "/src/img/heroes/Servant068.jpg",
    "弗朗西斯・德雷克": "/src/img/heroes/Servant065.jpg",
    "俄里翁": "/src/img/heroes/Servant060.jpg",
    "弗拉德三世": "/src/img/heroes/Servant052.jpg",
    "坂田金时": "/src/img/heroes/Servant051.jpg",
    "吉尔伽美什": "/src/img/heroes/Servant012.jpg",
    "阿蒂拉": "/src/img/heroes/Servant008.jpg"
}