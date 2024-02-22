"use strict"
const apiEndpoint = 'https://studentselector-backend.colorspark.net/';
let selectedCharacter = [];

function init() {
    removeElementsByClassName('tempElement');
    infoArea.classList.add('shadowBorder');
    infoArea.innerHTML = '';
    const infoList = [
        ['钻石数量', '大于等于...', 'number', 'coins', {
            'step': 1,
            'min': 1
        }],
        ['搜索', '关键词', 'text', 'things']
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

            createToast('加载中...', -1, '#FFF', '#414141', 'temp-search-loadingToast');

            doSearch(query, infoList[i][3])
                .then(r => {
                    if (r == 'NOT FOUND') {
                        createToast('未找到符合条件的角色', 4300, '#FFF', '#840D23');
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
        title.innerText = '查看角色列表';
        value.style.transform = 'translateY(-1px)';
        value.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M352 0c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9L370.7 96 201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L416 141.3l41.4 41.4c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V32c0-17.7-14.3-32-32-32H352zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>'

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
            let value = document.createElement('div');

            base.classList.add('selectedCharacterList');
            title.innerText = '已选择以下角色';

            for (let i = 0; i < selectedCharacter.length; i++) {
                let base = document.createElement('div');
                let span = document.createElement('span');
                let img = document.createElement('div');

                span.innerText = selectedCharacter[i];
                img.classList.add('img');
                img.style.backgroundImage = `url('${picList[selectedCharacter[i]]}')`;

                base.addEventListener('click', () => {
                    selectedCharacter = selectedCharacter.filter(item => item !== selectedCharacter[i]);
                    if (selectedCharacter.length === 0) {//处理角色被删完的情况
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
        const functionList = [
            {
                'name': '返回',
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>',
                'callback': 'init'
            },
            {
                'name': '清空',
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg>',
                'callback': 'clearSelectedCharacter'
            },
            {
                'name': '顶部',
                'iconSvg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M246.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 109.3 361.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160zm160 352l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 301.3 361.4 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z"/></svg>',
                'callback': 'backToTop'
            }
        ]
        let base = document.createElement('div');
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
            base.appendChild(iconCotainer);
        }
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

        if (currentKey.indexOf('(') > 0) {
            title.innerText = currentKey.split('(')[0];
            subtitle.innerText = currentKey.split('(')[1].split(')')[0];
        } else {
            title.innerText = currentKey;
        }

        value.dataset.value = Object.values(infoList)[i];
        pic.src = Object.values(infoList)[i];

        base.addEventListener('click', () => {
            if (selectedCharacter.includes(currentKey)) {
                base.classList.remove('selected');
                selectedCharacter = selectedCharacter.filter(item => item !== currentKey);
            } else {
                base.classList.add('selected');
                selectedCharacter.push(currentKey);
            }
            console.log(selectedCharacter);
        })

        value.appendChild(pic);
        titleContainer.appendChild(title);
        titleContainer.appendChild(subtitle);
        base.appendChild(titleContainer);
        base.appendChild(value);
        container.appendChild(base);

        infoArea.appendChild(container);
    }

    //恢复已经选择的角色
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
        console.log(infoList);
        const infoArea = document.getElementById('infoArea');
        const container = document.createElement('div');
        container.classList.add('shadowBorder');
        container.classList.add('infoContainer');
        for (let i = 0; i < Object.keys(infoList).length; i++) {
            const currentKey = Object.keys(infoList)[i];
            const displayKey = {
                'id': '编号',
                'coins': '钻石',
                'things': '英雄'
            }
            let base = document.createElement('div');
            let title = document.createElement('div');
            let value = document.createElement('div');

            base.classList.add('childPart');

            title.innerText = displayKey[currentKey];

            value.innerText = Object.values(infoList)[i];
            value.dataset.value = Object.values(infoList)[i];
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
        const r = await fetch(`${apiEndpoint}/?${type}=${encodeURIComponent(query)}`).then(r => r.json());
        console.log(r);
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
    for (let i = 0; i < sqlKeywords.length; i++) {
        if (input.toUpperCase().includes(sqlKeywords[i])) {
            return true;
        }
    }

    const symbols = ["'", '"', ';', '--', '()', '@', ')and(', '$'];
    for (let i = 0; i < symbols.length; i++) {
        if (input.includes(symbols[i])) {
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

function backToTop() {
    infoArea.children[0].scrollIntoView({
        behavior: "smooth"
    });
}

const picList = {
    "爱莉": "./src/img/students/is5l4fhk9q0bd3kgwyv3tkq40qff970.png",
    "朱音": "./src/img/students/mzuilag84gd5sht9cph8ingmx2q0dpn.png",
    "朱音(兔女郎)": "./src/img/students/qix3ibajhx05q9zfvy1kcvwfx079ron.png",
    "明里": "./src/img/students/razef68t85485eqa5gbcv41ka5lbfec.png",
    "亚子": "./src/img/students/fhlrvvecib3pplksz8umf0atvm98mm4.png",
    "爱丽丝": "./src/img/students/nmv9upej2ozfw5dt7lhow73ewxswa1j.png",
    "爱丽丝(女仆)": "./src/img/students/8srgb151m3k6yp3bi8wnfbzmm1b6h8x.png",
    "阿露": "./src/img/students/0izeehlfus8lm4koiu0kgzitvuhmudv.png",
    "阿露(正月)": "./src/img/students/67quje35zwe6lab3yr46s389b2d1dod.png",
    "明日奈": "./src/img/students/1wrtuqgy6eafe5164t52129bw09r5nw.png",
    "明日奈(兔女郎)": "./src/img/students/ofu7k9gg8g8nusigykv38szn0q1m91g.png",
    "亚津子": "./src/img/students/e7tvb71ob2oaovllc4m5d05sx7d0gz5.png",
    "绫音": "./src/img/students/ktjt9pvmms10dzmre4zzj5ooosmj87r.png",
    "绫音(泳装)": "./src/img/students/m1re0spdx7n8vasgkkk9w040n5d3x3m.png",
    "梓": "./src/img/students/1sg2u1j49wg80lo4adfsegb0u7h9bt0.png",
    "梓(泳装)": "./src/img/students/cdesr8ksa28u3b108sm8v1jm59185cu.png",
    "切里诺": "./src/img/students/ezo09rqxn47nfoqiupoc5wkvl5licso.png",
    "切里诺(温泉)": "./src/img/students/svaxilsemkx55mzyza5k8mgn3d16v52.png",
    "千寻": "./src/img/students/r6uuju590w4swa84eu9dc2repa6cane.png",
    "千夏": "./src/img/students/lf5msyw4mz46eqli22dv88z3urf71ag.png",
    "千夏(温泉)": "./src/img/students/d9jy5p7sr0k5tjsu1k3n1ja14p4u0nd.png",
    "千世": "./src/img/students/ajudcdj95vb4j3s9e9futxjssrrh6fq.png",
    "千世(泳装)": "./src/img/students/p4qtemhcm3a3e5q1y2r5c2bzaugdlg1.png",
    "艾米": "./src/img/students/5wr889xx4rrjwinxrqik57z9w7er9po.png",
    "吹雪": "./src/img/students/gywjir8o1ywhyy8jwgobrohkakydl32.png",
    "枫香": "./src/img/students/nssnm040vddjru2tsd07nbnokwvyzaz.png",
    "枫香(正月)": "./src/img/students/qgn6u31m432tkr3ye8gs7grdqa076nz.png",
    "花绘": "./src/img/students/oc29lohqkjllorrgmlij9ozsw6hwak6.png",
    "花绘(圣诞)": "./src/img/students/ftrwq2ys9r9htc3b9fz0hvjrkc87xch.png",
    "花子": "./src/img/students/hzfrzgvzpn9bgqcs5m4ryhlyknul6aj.png",
    "晴": "./src/img/students/n1y390wxq40cedpvpgvsxqy2jimehmc.png",
    "遥香": "./src/img/students/inni3bv2qr2no72lx5um2esdzaxleq2.png",
    "遥香(正月)": "./src/img/students/0agr85m25csrepsntwwrixcfmy33b0d.png",
    "晴奈": "./src/img/students/8s777cm7yzrlwkid13x3rx4n833jn6e.png",
    "晴奈(正月)": "./src/img/students/41ynn8l4aigjh9qc7rjgotske2zh9c9.png",
    "莲见": "./src/img/students/s6qq3fxgqwrcs63i1zk906inf1yv0qp.png",
    "莲见(体操服)": "./src/img/students/4iw9n8rtecse9pin6k6k28lt958h1an.png",
    "初音未来(联动)": "./src/img/students/5pnuwsuzpsqrs2i9gmd81eenc0zhexk.png",
    "响": "./src/img/students/eyl7j5tajy9r0pz4qpwo6pce1pqzej4.png",
    "响(应援团)": "./src/img/students/awrc77rkh4kqbdupdwscm45l2nrcfoq.png",
    "日富美": "./src/img/students/f61fvwffragpgrf4kpenn5awdknv4sd.png",
    "日富美(泳装)": "./src/img/students/7jmifcn7t2uznzxqmlfkfjyd8f27wpy.png",
    "日鞠": "./src/img/students/250a6idme1xw9h8vaovl01z9su6v2em.png",
    "日奈": "./src/img/students/o408j2olhv41dfcdq3onkmca3iq7q1c.png",
    "日奈(泳装)": "./src/img/students/pm51f09bgfhraco579802zjfzkn34pn.png",
    "日向": "./src/img/students/5enxzacmmv1xbf0b6qxzi8n2mb0nfcm.png",
    "日和": "./src/img/students/sc98uevrkfdkx9no92qcvpfkhmiquz1.png",
    "星野": "./src/img/students/dt084wtnycx53dq8w33973ehbrquksg.png",
    "星野(泳装)": "./src/img/students/8d9uvqhglzmxybw7u15bddhhflq65e3.png",
    "伊织": "./src/img/students/p4odstat936ldngtseandwihjya15qt.png",
    "伊织(泳装)": "./src/img/students/p6izwdlof9dkb9s9u5xl0altajlehim.png",
    "伊吕波": "./src/img/students/3oo0bs2wkssfop4x6bjhcschoo95tcq.png",
    "泉": "./src/img/students/kjdwfou2qub9ck21vp7cx66g7xkcrfc.png",
    "泉(泳装)": "./src/img/students/9v6kdnwy213gyfenuhpa0khbjul5xw8.png",
    "泉奈": "./src/img/students/a534tnhv9axfey620ec0er0c4t2786m.png",
    "泉奈(泳装)": "./src/img/students/hcedgjmo4klmyedmtr3ojgd6kujedi6.png",
    "淳子": "./src/img/students/nqjr3hhl0dov5450zy5yc65y8tloixy.png",
    "淳子(正月)": "./src/img/students/pf8xov1ewumarvjwtphmr0ky36qg17p.png",
    "朱莉": "./src/img/students/t7ccreqz42ev69o9iru6ml5rmf2rhaj.png",
    "枫": "./src/img/students/8e2x9a8xfk12u52immnzcmnc9geivj9.png",
    "果穗": "./src/img/students/oq0v3m13h1abt439ktsuh6w8jyth888.png",
    "叶渚": "./src/img/students/gurlvk4tyszyo0sejqbl37rt4fcb0ov.png",
    "花凛": "./src/img/students/9zwb2ajpzccz6v4wz263auderbe4627.png",
    "花凛(兔女郎)": "./src/img/students/3kof24r4w80izeo1f50f6k87mstir6g.png",
    "佳代子": "./src/img/students/nmu75etqmhaicfhzvf1r2lkwln3oe5x.png",
    "佳代子(正月)": "./src/img/students/rjus1g9s00ct97y0zjby6hmasorycmy.png",
    "和纱": "./src/img/students/tgeoh5f1yr57feeo5hul0vlhwmwx4ix.png",
    "桐乃": "./src/img/students/kmgl9oo8fv38oy0hap87mpdb3z4nlr3.png",
    "小春": "./src/img/students/ld03gn68q56maugvwoc1a62s3d0ub2t.png",
    "心奈": "./src/img/students/qa0cx5jjbeva5f8j6whqn0dspcjww2v.png",
    "小玉": "./src/img/students/b840plgws95784mv75h1ce58nr9wub0.png",
    "柯托莉": "./src/img/students/6xuhtyz7x7jtl2ldx4ly3vjop8f5fww.png",
    "小雪": "./src/img/students/lznrsa16k0q4eznxwbqvm7uvytdbk5e.png",
    "真纪": "./src/img/students/qbw10p2e7exhk1ttxaphz8bzx52bvhd.png",
    "玛丽": "./src/img/students/01mxw2601worll71z5c1jmrfwk4og2z.png",
    "玛丽(体操服)": "./src/img/students/8ss6gmqosop836cmmyp52ut9cw6o1dk.png",
    "玛丽娜": "./src/img/students/1kevmel8p44uz3mtsc16cktnl2st421.png",
    "真白": "./src/img/students/6m2o8t6i50hy9v6go426fggf74erbfx.png",
    "真白(泳装)": "./src/img/students/jlnde65xtqnfb387u31jbrj19m3o29f.png",
    "惠": "./src/img/students/pg0cszwjbivnxajlz6x2vpfkckw6i7p.png",
    "满": "./src/img/students/de6tvo7rgphbag0g8bmmkg1fyk5z9kd.png",
    "绿": "./src/img/students/rxxacudkjp9wk2hb42dosqlcxb3wgsh.png",
    "未花": "./src/img/students/g9jw5fee922fe4es2bv1syxn9dkmmri.png",
    "三森": "./src/img/students/rzoqnza7facuzwc715qm43d6no2jd92.png",
    "近卫南": "./src/img/students/e9ogfc8wgnhmg7p86yhequ84ouodzzz.png",
    "美祢": "./src/img/students/8969bvyexee11jbo18jwds0a499seb4.png",
    "美咲": "./src/img/students/kchufpgtis2rpebcnnbfivlcvq5riku.png",
    "宫子": "./src/img/students/ooijt262wggq40djmbgijyyew8rz037.png",
    "美游": "./src/img/students/75llka5ecc80nhqox7jlszjm3nsphts.png",
    "萌绘": "./src/img/students/lphr64ffm7350rorfwvtel7kp2pmv6j.png",
    "桃井": "./src/img/students/516w4cimmxzel6e35bqhvhz463tabq9.png",
    "睦月": "./src/img/students/8rvfolbuymwmagys12diy4lybmyv9xh.png",
    "睦月(正月)": "./src/img/students/r4eyrgwpniu0oif7oe81nm9n55rcaic.png",
    "渚": "./src/img/students/3m1on4rgocq8oyax32suy07okkoyuwa.png",
    "夏": "./src/img/students/jkff1xvsylui56zc89wj5ypv39gaxrh.png",
    "尼禄": "./src/img/students/dhqi47id5hsdu4chpvvb13slqsq6w36.png",
    "尼禄(兔女郎)": "./src/img/students/bd5yr7m3zisnjb035ifve7h4up736r2.png",
    "诺亚": "./src/img/students/6jru8fnb3g7px07hzajvym6rouoe9ii.png",
    "和香": "./src/img/students/02vyg5s8bg252zna47j3vw5yiehf1b6.png",
    "和香(温泉)": "./src/img/students/m7t61mmshl272vjzg4pfaqdrk84o0fx.png",
    "野宫": "./src/img/students/h01ob2v3ppnaggr445uoufrd0zfv4o6.png",
    "野宫(泳装)": "./src/img/students/52cbr73b6nqjod196v4ec56via2ga7s.png",
    "菲娜": "./src/img/students/oorbrk1ciju63teqir2yiasji12y8p2.png",
    "玲纱": "./src/img/students/j7cfcjovefje82lqcj5x3jdh70acnmy.png",
    "朱城留美": "./src/img/students/kx1gvxrwt0baafc8f6paospv2r13e20.png",
    "咲": "./src/img/students/4j7hh8dj576jy9erqkavnh73u3jd6m2.png",
    "樱子": "./src/img/students/azs805kca5af5wp9tgpd3qozvk1b6qj.png",
    "纱织": "./src/img/students/h1wl8w8d1e3u9hhelh34wzxa8crzk8h.png",
    "纱绫": "./src/img/students/6xfyaepm07nonge40hj8ms05c5so2l0.png",
    "纱绫(私服)": "./src/img/students/esbaluffu00tvxlyu6taucr8q8n329q.png",
    "濑名": "./src/img/students/cmrvm7wyliftq26ayz6y958jc1i1e4n.png",
    "芹香": "./src/img/students/katc970ai3os4hgljye00klf0hmqtpa.png",
    "芹香(正月)": "./src/img/students/oznfymy6csybsctxgtj7h59o1tjoxw7.png",
    "芹娜": "./src/img/students/d9xb2sw0siweswe8j4io1mb03n9slgq.png",
    "芹娜(圣诞)": "./src/img/students/dk95wmm6850ljnu83otb6psny1p0uha.png",
    "时雨": "./src/img/students/d1fx8nnt7954tp482nmfu5cyh8jsctg.png",
    "志美子": "./src/img/students/j7fgx8qpkv88igavrz9u0vo38gm4koh.png",
    "白子": "./src/img/students/jkv7zucp44863gsdwgt1bormwiea41f.png",
    "白子(骑行服)": "./src/img/students/p7jl5lgy2yxl5t87cz0w0y8y1d3i33s.png",
    "静子": "./src/img/students/nbiezy9rhv720xj12fy0tf3mqzqxvaw.png",
    "静子(泳装)": "./src/img/students/kghwbb7btfwspe2vkhxfzgfucbsdh9g.png",
    "瞬": "./src/img/students/j2ijz01fi0cke44wztkgi4ktjcvkpka.png",
    "瞬(幼女)": "./src/img/students/4u1i65x52woyq6wxkvu7umw91o5cose.png",
    "堇": "./src/img/students/msshpbsrnldyekxee8mfbggklirqiku.png",
    "铃美": "./src/img/students/grbm06mdicbiqlhkab8hlqcltukq3la.png",
    "时": "./src/img/students/lygj7d4w8fbl25nr9lltwgpt3e1e3qm.png",
    "时(兔女郎)": "./src/img/students/554j5k1hy1js9mi1pibc2sicx4vd2h2.png",
    "巴": "./src/img/students/c7gvvhpaz3spwn5pyjmu0gg20lrhc1g.png",
    "椿": "./src/img/students/cs9fr6ss2yvc6gpornhohcj3riklcb8.png",
    "月咏": "./src/img/students/my4r4c96nrqvtakozat0rj444evwdjs.png",
    "鹤城": "./src/img/students/5w2ouf15hfrfp30lpjww188z611pcnv.png",
    "鹤城(泳装)": "./src/img/students/osyrb0nee94fl870q4zgn8jopk4bsbi.png",
    "忧": "./src/img/students/gnep10wu2ht9c5ersk69p5kfcljylgo.png",
    "歌原": "./src/img/students/dqpk2u26mgghiidq2xkljwg3eyevwa7.png",
    "歌原(应援团)": "./src/img/students/bs3u9fs2oei2puxp1u1o3kziht4lomg.png",
    "若藻": "./src/img/students/lgulrjl7f2aq3wk5ehw8d2e5m4k9bhi.png",
    "若藻(泳装)": "./src/img/students/0srpx4djnah2bxgkcehjc1wideaex3m.png",
    "好美": "./src/img/students/n48cn66h6nagld3ay1cmprkozxir6qr.png",
    "优香": "./src/img/students/ehs3t8d5l98lkcckzqv2owgghhdbkds.png",
    "优香(体操服)": "./src/img/students/6mcbaxebln94ti2mpxwww392fr6itdn.png",
    "柚子": "./src/img/students/3389x8cgwd4uv01sddk4b4uls84xfou.png",
    "柚子(女仆)": "./src/img/students/t7ugk00ixz0xa4opxcoq3fac668o72x.png"
}