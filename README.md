# polymatx.github.io

Website: https://polymatx.dev

## Dev
Requires `python3` and `golang`

```sh
make dev
```


### Setting up GoLang and wasm_exec.js
#### Installing GoLang
GoLang is required to compile and manage WebAssembly modules using Go. Here's how to install Go:

```shell
sudo add-apt-repository ppa:longsleep/golang-backports
sudo apt update
sudo apt install golang-go
```

Once installed, verify the installation with:

```shell
go version
```

#### wasm_exec.js
`wasm_exec.js` is provided by the Go installation and is used to support Go's WebAssembly binaries in the web environment. It emulates a Go environment within the browser, handling tasks like memory management and system calls.

To run your server in the background continuously, especially on a VPS, you can use a variety of methods. Here are a few common approaches that are suitable for production or semi-production environments:

1. Using nohup Command
    ```sh
    nohup make dev &
    ```
2. Using screen or tmux
    ```shell
    screen -S server
    make dev
    # Press Ctrl+A then D to detach
    screen -r server
   ```
    ```shell
    tmux new -s server
    make dev
    # Press Ctrl+B then D to detach
    tmux attach -t server
   ```
3. Using Systemd (Recommended for Production)
   1. Create a systemd service file:

      ```shell
      nano /etc/systemd/system/website.service
      ```
      ```shell
      [Unit]
      Description=Website Terminal

      [Service]
      ExecStart=/usr/bin/make -C /path/to/your/project/dir dev
      WorkingDirectory=/path/to/your/project/dir
      User=your-user
      Restart=always

      [Install]
      WantedBy=multi-user.target
      ```
   2. Enable and start your service:
      ```shell
      sudo systemctl enable website.service
      sudo systemctl start website.service
      ```
   3. Check service status is OK or not  
      ```shell
      sudo systemctl status website.service
      journalctl -u myservice.service
      ```
   