document.addEventListener("DOMContentLoaded", () => {
    const title = document.getElementById("pageTitle");
    const activeUser = localStorage.getItem("pac_active_user");

    if (activeUser) {
        title.innerHTML = `PAC-MAN <span style="font-size:0.6em; color:#0ff;">– ${activeUser}</span>`;
    }
});
