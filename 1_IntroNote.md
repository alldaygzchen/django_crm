### Terminals

    cd Documents/
    cd ~　＃使用者目錄

    rm test.txt #file
    rm -r test #folder

### Git

    repository = project (there are local and remote repositories)

    git clone https://github.com/alldaygzchen/test.git
    git add .
    git commit -m "initial commit"
    git push # bring changes to remote repositories

    git checkout -b project1
    git branch --show-current
    git add .
    git commit -m "second commit"
    git push --set-upstream origin project1

    Use GUI
    # (Pull request) pull changes to a specific branch
    # (Merge pull request) confirm the pull request

    git checkout main
    git pull

### Vscode

    ctrl + shift +p => Preferences: open user seautittings (json)
    extensions: Django(Roberth Solis) Django Templates(bibhasdn)
    django-admin startproject <name> .  is another option

### Pycharm pro

    database suport including driver, plugin
    auto implement including virutal venv, code (knows django syntax), templates syntax ...

### Python

    insert multiple key value to dictionary
    dict.update({})

    class Hotel(House):
        pass

### Json

    stringify: dict => string e.g.json.dumps()
    string => dict e.g.json.loads()

    import json
    import requests

    response = requests.get(url)
    print(response.json()) # convert already to json
