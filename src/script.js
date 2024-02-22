"use strict"
const apiEndpoint = 'https://studentselector-backend.colorspark.net/';

function init() {
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

}

init();

async function openCharacterList() {
    infoArea.classList.remove('shadowBorder');
    infoArea.innerHTML = '';

    (() => {
        let base = document.createElement('div');
        let iconCotainer = document.createElement('div');
        let icon = document.createElement('div');
        let tip = document.createElement('div');

        base.classList.add('fixedBack');
        base.classList.add('shadowBorder');

        tip.innerText = '返回';
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>'

        base.addEventListener('click', init);
        iconCotainer.classList.add('iconCotainer');
        icon.classList.add('inlineSvgIcon');
        iconCotainer.appendChild(icon);
        iconCotainer.appendChild(tip);
        base.appendChild(iconCotainer);
        infoArea.appendChild(base);
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

        if (currentKey.indexOf('(') > 0) {
            title.innerText = currentKey.split('(')[0];
            subtitle.innerText = currentKey.split('(')[1].split(')')[0];
        } else {
            title.innerText = currentKey;
        }

        value.dataset.value = Object.values(infoList)[i];
        pic.src = Object.values(infoList)[i];

        base.addEventListener('click', () => {
            const textArea = document.createElement('textArea')
            textArea.value = currentKey;
            textArea.style.width = 0
            textArea.style.position = 'fixed'
            textArea.style.left = '-999px'
            textArea.style.top = '10px'
            textArea.setAttribute('readonly', 'readonly')
            document.body.appendChild(textArea)

            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)

            createToast('已复制角色名称');
        })


        value.appendChild(pic);
        titleContainer.appendChild(title);
        titleContainer.appendChild(subtitle);
        base.appendChild(titleContainer);
        base.appendChild(value);
        container.appendChild(base);

        infoArea.appendChild(container);
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


const picList = {
    "Akane (Bunny Girl)": "./src/img/400px-Akane_%28Bunny_Girl%29.png",
    "Ako": "./src/img/400px-Ako.png",
    "Ako (Dress)": "./src/img/400px-Ako_%28Dress%29.png",
    "Arisu": "./src/img/400px-Arisu.png",
    "Arisu (Maid)": "./src/img/400px-Arisu_%28Maid%29.png",
    "Aru": "./src/img/400px-Aru.png",
    "Aru (New Year)": "./src/img/400px-Aru_%28New_Year%29.png",
    "Asuna (Bunny Girl)": "./src/img/400px-Asuna_%28Bunny_Girl%29.png",
    "Atsuko": "./src/img/400px-Atsuko.png",
    "Azusa": "./src/img/400px-Azusa.png",
    "Azusa (Swimsuit)": "./src/img/400px-Azusa_%28Swimsuit%29.png",
    "Cherino": "./src/img/400px-Cherino.png",
    "Cherino (Hot Spring)": "./src/img/400px-Cherino_%28Hot_Spring%29.png",
    "Chihiro": "./src/img/400px-Chihiro.png",
    "Chinatsu (Hot Spring)": "./src/img/400px-Chinatsu_%28Hot_Spring%29.png",
    "Chise (Swimsuit)": "./src/img/400px-Chise_%28Swimsuit%29.png",
    "Eimi": "./src/img/400px-Eimi.png",
    "Eimi (Swimsuit)": "./src/img/400px-Eimi_%28Swimsuit%29.png",
    "Fuuka (New Year)": "./src/img/400px-Fuuka_%28New_Year%29.png",
    "Hanae (Christmas)": "./src/img/400px-Hanae_%28Christmas%29.png",
    "Hanako (Swimsuit)": "./src/img/400px-Hanako_%28Swimsuit%29.png",
    "Hare (Camping)": "./src/img/400px-Hare_%28Camping%29.png",
    "Haruka (New Year)": "./src/img/400px-Haruka_%28New_Year%29.png",
    "Haruna": "./src/img/400px-Haruna.png",
    "Haruna (New Year)": "./src/img/400px-Haruna_%28New_Year%29.png",
    "Haruna (Sportswear)": "./src/img/400px-Haruna_%28Sportswear%29.png",
    "Hatsune Miku": "./src/img/400px-Hatsune_Miku.png",
    "Hibiki": "./src/img/400px-Hibiki.png",
    "Hifumi": "./src/img/400px-Hifumi.png",
    "Hifumi (Swimsuit)": "./src/img/400px-Hifumi_%28Swimsuit%29.png",
    "Himari": "./src/img/400px-Himari.png",
    "Hina": "./src/img/400px-Hina.png",
    "Hina (Dress)": "./src/img/400px-Hina_%28Dress%29.png",
    "Hina (Swimsuit)": "./src/img/400px-Hina_%28Swimsuit%29.png",
    "Hinata": "./src/img/400px-Hinata.png",
    "Hinata (Swimsuit)": "./src/img/400px-Hinata_%28Swimsuit%29.png",
    "Hiyori": "./src/img/400px-Hiyori.png",
    "Hoshino": "./src/img/400px-Hoshino.png",
    "Hoshino (Swimsuit)": "./src/img/400px-Hoshino_%28Swimsuit%29.png",
    "Ichika": "./src/img/400px-Ichika.png",
    "Iori": "./src/img/400px-Iori.png",
    "Iori (Swimsuit)": "./src/img/400px-Iori_%28Swimsuit%29.png",
    "Iroha": "./src/img/400px-Iroha.png",
    "Izumi": "./src/img/400px-Izumi.png",
    "Izuna": "./src/img/400px-Izuna.png",
    "Izuna (Swimsuit)": "./src/img/400px-Izuna_%28Swimsuit%29.png",
    "Kaede": "./src/img/400px-Kaede.png",
    "Kaho": "./src/img/400px-Kaho.png",
    "Kanna": "./src/img/400px-Kanna.png",
    "Karin": "./src/img/400px-Karin.png",
    "Karin (Bunny Girl)": "./src/img/400px-Karin_%28Bunny_Girl%29.png",
    "Kasumi": "./src/img/400px-Kasumi.png",
    "Kayoko (New Year)": "./src/img/400px-Kayoko_%28New_Year%29.png",
    "Kazusa": "./src/img/400px-Kazusa.png",
    "Kikyou": "./src/img/400px-Kikyou.png",
    "Koharu": "./src/img/400px-Koharu.png",
    "Kokona": "./src/img/400px-Kokona.png",
    "Kotama (Camping)": "./src/img/400px-Kotama_%28Camping%29.png",
    "Kotori (Cheerleader)": "./src/img/400px-Kotori_%28Cheerleader%29.png",
    "Koyuki": "./src/img/400px-Koyuki.png",
    "Maki": "./src/img/400px-Maki.png",
    "Makoto": "./src/img/400px-Makoto.png",
    "Mari (Sportswear)": "./src/img/400px-Mari_%28Sportswear%29.png",
    "Marina": "./src/img/400px-Marina.png",
    "Mashiro": "./src/img/400px-Mashiro.png",
    "Mashiro (Swimsuit)": "./src/img/400px-Mashiro_%28Swimsuit%29.png",
    "Megu": "./src/img/400px-Megu.png",
    "Meru": "./src/img/400px-Meru.png",
    "Midori": "./src/img/400px-Midori.png",
    "Mika": "./src/img/400px-Mika.png",
    "Mimori": "./src/img/400px-Mimori.png",
    "Mimori (Swimsuit)": "./src/img/400px-Mimori_%28Swimsuit%29.png",
    "Mina": "./src/img/400px-Mina.png",
    "Mine": "./src/img/400px-Mine.png",
    "Minori": "./src/img/400px-Minori.png",
    "Misaka Mikoto": "./src/img/400px-Misaka_Mikoto.png",
    "Misaki": "./src/img/400px-Misaki.png",
    "Miyako": "./src/img/400px-Miyako.png",
    "Miyako (Swimsuit)": "./src/img/400px-Miyako_%28Swimsuit%29.png",
    "Miyu": "./src/img/400px-Miyu.png",
    "Moe": "./src/img/400px-Moe.png",
    "Mutsuki (New Year)": "./src/img/400px-Mutsuki_%28New_Year%29.png",
    "Nagisa": "./src/img/400px-Nagisa.png",
    "Natsu": "./src/img/400px-Natsu.png",
    "Neru": "./src/img/400px-Neru.png",
    "Neru (Bunny Girl)": "./src/img/400px-Neru_%28Bunny_Girl%29.png",
    "Noa": "./src/img/400px-Noa.png",
    "Nodoka (Hot Spring)": "./src/img/400px-Nodoka_%28Hot_Spring%29.png",
    "Nonomi (Swimsuit)": "./src/img/400px-Nonomi_%28Swimsuit%29.png",
    "Reisa": "./src/img/400px-Reisa.png",
    "Renge": "./src/img/400px-Renge.png",
    "Rumi": "./src/img/400px-Rumi.png",
    "Saki": "./src/img/400px-Saki.png",
    "Saki (Swimsuit)": "./src/img/400px-Saki_%28Swimsuit%29.png",
    "Sakurako": "./src/img/400px-Sakurako.png",
    "Saori": "./src/img/400px-Saori.png",
    "Saya": "./src/img/400px-Saya.png",
    "Saya (Casual)": "./src/img/400px-Saya_%28Casual%29.png",
    "Sena": "./src/img/400px-Sena.png",
    "Serika (New Year)": "./src/img/400px-Serika_%28New_Year%29.png",
    "Serina (Christmas)": "./src/img/400px-Serina_%28Christmas%29.png",
    "Shigure": "./src/img/400px-Shigure.png",
    "Shigure (Hot Spring)": "./src/img/400px-Shigure_%28Hot_Spring%29.png",
    "Shiroko": "./src/img/400px-Shiroko.png",
    "Shiroko (Riding)": "./src/img/400px-Shiroko_%28Riding%29.png",
    "Shiroko (Swimsuit)": "./src/img/400px-Shiroko_%28Swimsuit%29.png",
    "Shokuhou Misaki": "./src/img/400px-Shokuhou_Misaki.png",
    "Shun": "./src/img/400px-Shun.png",
    "Shun (Kid)": "./src/img/400px-Shun_%28Kid%29.png",
    "Sumire": "./src/img/400px-Sumire.png",
    "Toki": "./src/img/400px-Toki.png",
    "Toki (Bunny Girl)": "./src/img/400px-Toki_%28Bunny_Girl%29.png",
    "Tsukuyo": "./src/img/400px-Tsukuyo.png",
    "Tsurugi": "./src/img/400px-Tsurugi.png",
    "Ui": "./src/img/400px-Ui.png",
    "Ui (Swimsuit)": "./src/img/400px-Ui_%28Swimsuit%29.png",
    "Utaha (Cheerleader)": "./src/img/400px-Utaha_%28Cheerleader%29.png",
    "Wakamo": "./src/img/400px-Wakamo.png",
    "Wakamo (Swimsuit)": "./src/img/400px-Wakamo_%28Swimsuit%29.png",
    "Yukari": "./src/img/400px-Yukari.png",
    "Yuuka (Sportswear)": "./src/img/400px-Yuuka_%28Sportswear%29.png",
    "Yuzu": "./src/img/400px-Yuzu.png",
    "Airi": "./src/img/400px-Airi.png",
    "Akane": "./src/img/400px-Akane.png",
    "Akari": "./src/img/400px-Akari.png",
    "Ayane": "./src/img/400px-Ayane.png",
    "Chise": "./src/img/400px-Chise.png",
    "Fuuka": "./src/img/400px-Fuuka.png",
    "Hanae": "./src/img/400px-Hanae.png",
    "Hanako": "./src/img/400px-Hanako.png",
    "Hare": "./src/img/400px-Hare.png",
    "Hasumi": "./src/img/400px-Hasumi.png",
    "Junko": "./src/img/400px-Junko.png",
    "Kayoko": "./src/img/400px-Kayoko.png",
    "Kirino": "./src/img/400px-Kirino.png",
    "Mari": "./src/img/400px-Mari.png",
    "Momiji": "./src/img/400px-Momiji.png",
    "Momoi": "./src/img/400px-Momoi.png",
    "Mutsuki": "./src/img/400px-Mutsuki.png",
    "Nonomi": "./src/img/400px-Nonomi.png",
    "Serika": "./src/img/400px-Serika.png",
    "Shizuko": "./src/img/400px-Shizuko.png",
    "Tsubaki": "./src/img/400px-Tsubaki.png",
    "Utaha": "./src/img/400px-Utaha.png",
    "Yuuka": "./src/img/400px-Yuuka.png",
    "Asuna": "./src/img/400px-Asuna.png",
    "Ayane (Swimsuit)": "./src/img/400px-Ayane_%28Swimsuit%29.png",
    "Chinatsu": "./src/img/400px-Chinatsu.png",
    "Fubuki": "./src/img/400px-Fubuki.png",
    "Haruka": "./src/img/400px-Haruka.png",
    "Hasumi (Sportswear)": "./src/img/400px-Hasumi_%28Sportswear%29.png",
    "Hibiki (Cheerleader)": "./src/img/400px-Hibiki_%28Cheerleader%29.png",
    "Ibuki": "./src/img/400px-Ibuki.png",
    "Izumi (Swimsuit)": "./src/img/400px-Izumi_%28Swimsuit%29.png",
    "Junko (New Year)": "./src/img/400px-Junko_%28New_Year%29.png",
    "Juri": "./src/img/400px-Juri.png",
    "Koharu (Swimsuit)": "./src/img/400px-Koharu_%28Swimsuit%29.png",
    "Kotama": "./src/img/400px-Kotama.png",
    "Kotori": "./src/img/400px-Kotori.png",
    "Michiru": "./src/img/400px-Michiru.png",
    "Miyu (Swimsuit)": "./src/img/400px-Miyu_%28Swimsuit%29.png",
    "Nodoka": "./src/img/400px-Nodoka.png",
    "Pina": "./src/img/400px-Pina.png",
    "Saten Ruiko": "./src/img/400px-Saten_Ruiko.png",
    "Serina": "./src/img/400px-Serina.png",
    "Shimiko": "./src/img/400px-Shimiko.png",
    "Shizuko (Swimsuit)": "./src/img/400px-Shizuko_%28Swimsuit%29.png",
    "Suzumi": "./src/img/400px-Suzumi.png",
    "Tomoe": "./src/img/400px-Tomoe.png",
    "Tsurugi (Swimsuit)": "./src/img/400px-Tsurugi_%28Swimsuit%29.png",
    "Yoshimi": "./src/img/400px-Yoshimi.png",
    "Yuzu (Maid)": "./src/img/400px-Yuzu_%28Maid%29.png"
}