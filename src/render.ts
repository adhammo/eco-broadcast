import { connect, isConnected, disconnect, publishTemperature } from "./broker";
import { getPorts, open, isOpened, close } from "./serial";

window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connect")! as HTMLButtonElement;
  const connectedTag = document.getElementById("connected")! as HTMLSpanElement;
  const publishBtn = document.getElementById("publish")! as HTMLButtonElement;

  let publishing = false;
  const setPublish = (publish: boolean, force: boolean = false) => {
    if (!force && publishing === publish) return;

    const label = publishBtn.querySelector("._label")!;
    const icon = publishBtn.querySelector("._icon")!;

    if (publish) {
      publishBtn.classList.add("is-danger");
      label.innerHTML = "Stop";
      icon.innerHTML = "pan_tool";
      publishing = true;

      connectedTag.innerText = connectedTag.innerText + " & publishing";
    } else {
      publishBtn.classList.remove("is-danger");
      label.innerHTML = "Publish";
      icon.innerHTML = "contactless";
      publishing = false;

      connectedTag.innerText = connectedTag.innerText.replace(" & publishing", "");
    }
  };

  setPublish(false, true);

  const showPublish = (show: boolean) => {
    if (show) {
      publishBtn.style.display = "inherit";
    } else {
      publishBtn.style.display = "none";
      setPublish(false);
    }
  };

  showPublish(false);

  publishBtn.addEventListener("click", () => {
    setPublish(!publishing);
  });

  const setConnect = (connected: boolean) => {
    const label = connectBtn.querySelector("._label")!;
    const icon = connectBtn.querySelector("._icon")!;

    if (connected) {
      connectBtn.classList.remove("is-success");
      connectBtn.classList.add("is-danger");
      connectedTag.classList.remove("is-danger");
      connectedTag.classList.add("is-success");
      label.innerHTML = "Disconnect";
      icon.innerHTML = "cancel";
      connectedTag.innerHTML = "Connected";
    } else {
      connectBtn.classList.remove("is-danger");
      connectBtn.classList.add("is-success");
      connectedTag.classList.remove("is-success");
      connectedTag.classList.add("is-danger");
      label.innerHTML = "Connect";
      icon.innerHTML = "cloud_upload";
      connectedTag.innerHTML = "Disconnected";
    }
  };

  setConnect(false);

  connectBtn.addEventListener("click", () => {
    if (isConnected()) {
      disconnect();
    } else {
      connect(
        () => {
          setConnect(true);
          showPublish(isOpened());
        },
        () => {
          setConnect(false);
          showPublish(false);
        }
      );
    }
  });

  const reading = document.getElementById("reading")! as HTMLSpanElement;
  const openBtn = document.getElementById("open")! as HTMLButtonElement;
  const openedTag = document.getElementById("opened")! as HTMLSpanElement;
  const portsDrop = document.getElementById("ports")! as HTMLDivElement;
  const portsButton = document.getElementById("ports-button")! as HTMLButtonElement;
  const portsMenu = document.getElementById("ports-menu")! as HTMLDivElement;
  const portsSelected = document.getElementById("ports-selected")! as HTMLSpanElement;
  const portsRefresh = document.getElementById("ports-refresh")! as HTMLButtonElement;

  let portsItems: {
    path: string;
    manufacturer: string | undefined;
    item: HTMLAnchorElement;
  }[] = [];
  let selectedPort = -1;

  const selectPort = (index: number) => {
    if (selectedPort === index) return;

    if (selectedPort !== -1) {
      const oldPort = portsItems[selectedPort];
      oldPort.item.classList.remove("is-active");
    } else {
      const emptyItem = portsMenu.querySelector(".is-empty")!;
      emptyItem.classList.remove("is-active");
    }

    selectedPort = index;
    if (selectedPort !== -1) {
      const newPort = portsItems[selectedPort];
      newPort.item.classList.add("is-active");
      portsSelected.innerHTML = `${newPort.path}${
        newPort.manufacturer && ` | ${newPort.manufacturer}`
      }`;
      openBtn.disabled = false;
    } else {
      const emptyItem = portsMenu.querySelector(".is-empty")!;
      emptyItem.classList.add("is-active");
      portsSelected.innerHTML = "Choose a port";
      openBtn.disabled = true;
    }

    if (portsDrop.classList.contains("is-active"))
      portsDrop.classList.remove("is-active");
  };

  const populatePorts = () => {
    getPorts().then((ports) => {
      const portsContent = portsMenu.querySelector(".dropdown-content")!;
      portsContent.innerHTML = "";

      const emptyItem = document.createElement("a");
      emptyItem.href = "#";
      emptyItem.className = "dropdown-item is-empty is-active";
      emptyItem.innerHTML = "Choose a port";
      emptyItem.addEventListener("click", (e) => {
        e.preventDefault();
        selectPort(-1);
      });
      portsContent.appendChild(emptyItem);

      ports.forEach((port, index) => {
        const item = document.createElement("a");
        item.href = "#";
        item.className = "dropdown-item";
        item.innerHTML = `${port.path}${port.manufacturer && ` | ${port.manufacturer}`}`;

        item.addEventListener("click", (e) => {
          e.preventDefault();
          selectPort(index);
        });

        portsContent.appendChild(item);
        portsItems.push({ ...port, item });
      });

      selectedPort = -1;
      portsSelected.innerHTML = "Choose a port";
      openBtn.disabled = true;
    });
  };

  populatePorts();

  portsButton.addEventListener("click", () => {
    if (portsDrop.classList.contains("is-active")) {
      portsDrop.classList.remove("is-active");
    } else {
      portsDrop.classList.add("is-active");
    }
  });

  portsRefresh.addEventListener("click", () => {
    populatePorts();
  });

  const setOpen = (opened: boolean) => {
    const label = openBtn.querySelector("._label")!;
    const icon = openBtn.querySelector("._icon")!;

    if (opened) {
      openBtn.classList.remove("is-link");
      openBtn.classList.add("is-danger");
      openedTag.classList.remove("is-danger");
      openedTag.classList.add("is-link");
      label.innerHTML = "Close";
      icon.innerHTML = "cancel";
      openedTag.innerHTML = "Opened";
      portsButton.disabled = true;
      portsRefresh.disabled = true;
    } else {
      openBtn.classList.remove("is-danger");
      openBtn.classList.add("is-link");
      openedTag.classList.remove("is-link");
      openedTag.classList.add("is-danger");
      label.innerHTML = "Open";
      icon.innerHTML = "usb";
      openedTag.innerHTML = "Closed";
      portsButton.disabled = false;
      portsRefresh.disabled = false;
      reading.innerHTML = "No Serial";
    }
  };

  setOpen(false);

  openBtn.addEventListener("click", () => {
    if (isOpened()) {
      close();
    } else {
      open(
        portsItems[selectedPort].path,
        () => {
          setOpen(true);
          showPublish(isConnected());
        },
        (value) => {
          reading.innerHTML = value.toFixed(2).toString();
          if (publishing) {
            publishTemperature(value);
          }
        },
        () => {
          setOpen(false);
          showPublish(false);
        }
      );
    }
  });
});

window.addEventListener("beforeunload", () => {
  disconnect();
  close();
});
