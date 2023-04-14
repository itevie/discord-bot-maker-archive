// This file contains utilisation functions

// Validate a text field
function validate(el, regex) {
    let text = el.value;
    if (!text.match(regex)) {
        el.style["border-color"] = "red";
        return false;
    } else {
        el.style["border-color"] = "green";
        return true;
    }
}

// Function to show an FAQ page
function showFAQ(faq) {
    let data = window.electron.getFAQ(faq);
    document.getElementById("faqViewer").innerHTML = data;
    showDiv("faqViewer");
    setDivHistory("FAQ:" + faq);
}

// Function to reload the page and navigate back to a page once it's finished reloading
function reloadTo(divID) {
    localStorage.setItem("reloadTo", divID);
    location.reload();
}

// Function to crop text to a specified amount of length
function cropText(s, len) {
    if (s.length - 3 > len) {
        s = s.substring(0, s.length - (s.length - len));
        showDiv += "...";
    }

    console.log(s)

    return s;
}

// Function to prettify sentences
function prettify(string) {
    string = string.replace(/[_\-]/g, " ");
    let words = string.split(" ");

    for (let i in words) {
        let word = words[i].split("");
        if (!word[0]) continue;
        word[0] = word[0].toUpperCase();
        words[i] = word.join("");
    }

    return words.join(" ");
}

// Function to disable all buttons, used for when a bot is starting so they don't mess anything up
function disableAll() {
    let buttons = document.getElementsByTagName("button");
    let imgs = document.getElementsByName("img");
    for (const button of buttons) {
        if (button.hasAttribute("data-onsidebar") || button.hasAttribute("data-nodisable")) continue;
        button.disabled = true;
    }

    for (const button of buttons) {
        if (button.hasAttribute("data-onsidebar") || button.hasAttribute("data-nodisable")) continue;
        button.disabled = true;
    }
}

// Function to enable all those buttons
function enableAll() {
    let buttons = document.getElementsByTagName("button");
    let imgs = document.getElementsByName("img");
    for (const button of buttons) {
        if (button.hasAttribute("data-onsidebar")) continue;
        button.disabled = false;
    }

    for (const img of imgs) {
        if (img.hasAttribute("data-onsidebar") || img.hasAttribute("data-nodisable")) continue;
        img.disabled = true;
    }
}

// Auto correct stuff
var closestMatch = function (target, array, showOccurrences) {
    if (showOccurrences === void 0) { showOccurrences = false; }
    if (array.length === 0)
        return null;
    var vals = [];
    var found = [];
    for (var i = 0; i < array.length; i++)
        vals.push((0, distance)(target, array[i]));
    var min = Math.min.apply(Math, vals);
    for (var i = 0; i < vals.length; i++) {
        if (vals[i] === min)
            found.push(array[i]);
    }
    return showOccurrences ? found : found[0];
};

var distance = function (a, b) {
    var _a;
    if (a.length === 0)
        return b.length;
    if (b.length === 0)
        return a.length;
    if (a.length > b.length)
        _a = [b, a], a = _a[0], b = _a[1];
    var row = [];
    for (var i = 0; i <= a.length; i++)
        row[i] = i;
    for (var i = 1; i <= b.length; i++) {
        var prev = i;
        for (var j = 1; j <= a.length; j++) {
            var val = void 0;
            if (b.charAt(i - 1) === a.charAt(j - 1))
                val = row[j - 1];
            else
                val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
            row[j - 1] = prev;
            prev = val;
        }
        row[a.length] = prev;
    }
    return row[a.length];
};