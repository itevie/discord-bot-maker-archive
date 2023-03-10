async function fun() {
    console.log("fun called")
    await setTimeout(() => {
        return "hi!";
    }, 1000);
}

(async () => {
    let a = await fun();
    console.log("finished");
})();