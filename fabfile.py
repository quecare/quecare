from fabric.api import local, run, cd, env

APP_FOLDER = 'mychora'
BUILD_FILES = ' '.join(['choraclient/', 'clinics/', 'commons/', 'static/js', 'static/css', 'static/imgs',
                       'static/templates', 'tasks', 'templates', 'requirements', 'models', 'apps', '*.py'])

env.user = "jideobs"
env.hosts = ["104.236.194.215"]


def deploy():
    local("gulp --gulpfile static/gulpfile.js minifyStyles")
    local("gulp --gulpfile static/gulpfile.js minifyScripts")

    build_name = '{}.tar'.format(APP_FOLDER)

    local("tar -cvf {} {}".format(build_name, BUILD_FILES))
    local("scp {} {}@{}:~/".format(build_name, env.user, env.hosts))

    run("tar -xvf {} -C {}".format(build_name, APP_FOLDER))

    with cd(APP_FOLDER):
        run("source venv/bin/activate && pip install -r requirements")
        run("sudo service mychora restart")
        run("sudo service mychora-celery restart")
        run("sudo service nginx restart")
