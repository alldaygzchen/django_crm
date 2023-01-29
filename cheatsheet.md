# Notes

        Better structure: startproject: django-admin startproject djcrm .
        gitignore files: https://github.com/github/gitignore/blob/main/Python.gitignore
        base_dir = django_crm

        #####

        sqlite (alexcvzz) => sqlite3 => open database
        tables naming => app name_model name (verify by ssqlite tables)


        #####

        SOURCE_CHOICES = (
                ("Youtube","Youtube"),
                ("Google","Google"),
                ("Newsletter","Newsletter")
        ) #(value,display)

        source = models.CharField(choices = SOURCE_CHOICES, max_length=100)
        profile_picture = models.ImageField(blank=True,null=True) #blank=empty string, #null=no value

        #####
        Create own user custom model (Django suggest)
        from django.contrib.auth.models import AbstractUser
        class User(AbstractUser): #adding additional field to User
                pass

         {% for lead in leads %} <li>{{ lead }}</li> {% endfor %} # str default


        Lead.objects.create() #will save info

        using model form, we do not need to call model class or instance => form.save()

        #####
        <a href="{% url 'leads:lead-create' %}">Create a new lead</a> namespace [leads] and name [lead-create]

        #####
        tailwind tools: https://tailblocks.cc/

        #####
        CBV import: from django.views import generic
        Only generic.CreateView: Not need queryset

        ### (Following can be omiteed in dev  if static files not in static_root)
        if settings.DEBUG:
                urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

## Send Emails (Overwrites)

                def form_valid(self, form):
                        send_mail(
                        subject="A lead has been created",
                        message="Go to the site to see the new lead",
                        from_email="test@test.com",
                        recipient_list=["test2@test.com"]
                        )
                        return super(LeadCreateView, self).form_valid(form)

                EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

## Authentication

        ### login

        1.Due to the default: add registration folder with login and signup templates
        2. from django.contrib.auth.views import LoginView

        urlpatterns = [
                path('admin/', admin.site.urls),
                path('leads/',  include('leads.urls', namespace="leads")),
                path('', LandingPageView.as_view(), name='landing-page'),
                path('login/', LoginView.as_view(), name='login'),
        ]
        3. LOGIN_REDIRECT_URL = "/leads/"
        4. templates syntax:{% if request.user.is_authenticated %}{% endif %}  {{ request.user.username }}


        ### signup

        1.

        User = get_user_model()

        class CustomUserCreationForm(UserCreationForm):
                class Meta:(copy and paste)
                        model = User (overwrite)
                        fields = ("username",)
                        field_classes = {'username': UsernameField}
        2.
        class SignupView(generic.CreateView):
                template_name = "registration/signup.html"
                form_class = CustomUserCreationForm

                def get_success_url(self):
                        return reverse("login")
        3. signup.html
        4. urls.py

## Test (we can also create tests folder)

        reference: https://adamj.eu/tech/2020/06/15/how-to-unit-test-a-django-form/
        1. create file starting with test
                from django.test import TestCase
                from django.shortcuts import reverse


                class LandingPageTest(TestCase):

                def test_get(self):
                        response = self.client.get(reverse("landing-page"))
                        self.assertEqual(response.status_code, 200)
                        self.assertTemplateUsed(response, "landing.html")
        2. python manage.py test

## Auth restriction

        1. settings.py => LOGIN_URL = "/login/"
        2. views.py =>　from django.contrib.auth.mixins import LoginRequiredMixin
        3. organization means the person who request someone to be an agent

## Signal (Listening to events)

        1. from django.db.models.signals import post_save,pre_save
        2. models.py

        def post_user_created_signal(sender, instance, created, **kwargs):
        if created:
                UserProfile.objects.create(user=instance)


        post_save.connect(post_user_created_signal, sender=User)

## CRUD

        1. class view: get_queryset,get_success_url,form_valid,get_context_data,get_form_kwargs
        2. self.request.user.userprofile (cross model query)

## Filter Agents

        1. AgentDeleteView, AgentUpdateView,AgentDetailView,AgentListView
        2.
        organisation = self.request.user.userprofile
        Agent.objects.filter(organisation=organisation)

## User types (Define different type of users)

        class User(AbstractUser):
                is_organisor = models.BooleanField(default=True)
                is_agent = models.BooleanField(default=False)

## Agent Mixin (Custom middlware) organizor and agents(cannot see agents) has different content

        (this only hides)
        {% if request.user.is_organisor %}{% endif %}
        {% if request.user.is_authenticated %}{% endif %}


        (this restricts)
        1. mixins.py

        class OrganisorAndLoginRequiredMixin(AccessMixin):
        """Verify that the current user is authenticated and is an organisor."""
        def dispatch(self, request, *args, **kwargs):
                if not request.user.is_authenticated or not request.user.is_organisor:
                return redirect("leads:lead-list")
                return super().dispatch(request, *args, **kwargs)

        2. views.py

        class AgentListView(OrganisorAndLoginRequiredMixin, generic.ListView):
        template_name = "agents/agent_list.html"

        def get_queryset(self):
                organisation = self.request.user.userprofile
                return Agent.objects.filter(organisation=organisation)

## Leads Queryset although leads can be seen, control the content organization and different agent [Filter Leads]

        1.

        class LeadDetailView(LoginRequiredMixin, generic.DetailView):
                template_name = "leads/lead_detail.html"
                context_object_name = "lead"

        def get_queryset(self):
                user = self.request.user
                # initial queryset of leads for the entire organisation
                if user.is_organisor:
                queryset = Lead.objects.filter(organisation=user.userprofile)
                else:
                queryset = Lead.objects.filter(organisation=user.agent.organisation)
                # filter for the agent that is logged in
                queryset = queryset.filter(agent__user=user)
                return queryset

        2.
        leads (OrganisorAndLoginRequiredMixin): LeadDeleteView, LeadCreateView, LeadUpdateView
        agents (OrganisorAndLoginRequiredMixin): AgentListView,AgentCreateView,AgentDetailView,AgentUpdateView
        AgentDeleteView

        3. user.userprofile (cross model), user.agent.organisation(cross model and same model)

## Invite Agent

        Since agent should require basic info
        1.
        User = get_user_model()
        class AgentModelForm(forms.ModelForm):
        class Meta:
                model = User
                fields = (
                'email',
                'username',
                'first_name',
                'last_name'
                )
        2. views.py =>user.set_password(f"{random.randint(0, 1000000)}")
        3. send email

## Password Reset

        sending email url to the confirm page

        1. from django.contrib.auth.views import (PasswordResetView,
                PasswordResetDoneView,
                PasswordResetConfirmView,
                PasswordResetCompleteView
        )
        2. Create templates:
        password_reset_complete.html, password_reset_confirm.html, password_reset_done.html
        password_reset_email.html,signup.html

## Show Unassigned leads

        1. views.py => modify LeadListView
        2. modify => lead_list.html

## Assign Agents

        agent = forms.ChoiceField(("agent 1","agent 1 full name"),(("agent 2","agent 2 full name")))
        agent = forms.ModelChoiceField(queryset=Agent.objects.none()) (use query)


        1. views.py (forms hard to dynamic choice according different user )
                class AssignAgentView(OrganisorAndLoginRequiredMixin, generic.FormView):
                template_name = "leads/assign_agent.html"
                form_class = AssignAgentForm

                def get_form_kwargs(self, **kwargs):
                        kwargs = super(AssignAgentView, self).get_form_kwargs(**kwargs)
                        kwargs.update({
                        "request": self.request
                        })
                        return kwargs



                def get_success_url(self):
                        return reverse("leads:lead-list")

                def form_valid(self, form):
                        agent = form.cleaned_data["agent"]
                        lead = Lead.objects.get(id=self.kwargs["pk"])
                        lead.agent = agent
                        lead.save()
                        return super(AssignAgentView, self).form_valid(form)

        2. forms.py ()
        class AssignAgentForm(forms.Form):
        agent = forms.ModelChoiceField(queryset=Agent.objects.none())

        def __init__(self, *args, **kwargs):
                request = kwargs.pop("request")
                agents = Agent.objects.filter(organisation=request.user.userprofile)
                super(AssignAgentForm, self).__init__(*args, **kwargs)
                self.fields["agent"].queryset = agents

## Category model (show the ongoin process)

        1. class Category(models.Model):
        name = models.CharField(max_length=30)  # New, Contacted, Converted, Unconverted
        organisation = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

        def __str__(self):
                return self.name
        2.vies.py: CategoryListView

## Category Detail Update View

        1. Detail view has a method called self.get_object() to get queryset instance
        2. Reverse with kwargs: reverse("leads:lead-detail", kwargs={"pk": self.get_object().id})

## Cripsy Form

        1. Usefull website: djangopackages.org
        2. pip install django-crispy-forms
        3. setting.py => INSTALLED_APPS add 'crispy_forms','crispy_tailwind'
        and CRISPY_TEMPLATE_PACK = 'tailwind'
        and CRISPY_ALLOWED_TEMPLATE_PACKS = "tailwind"
        4. reference: login.html

## Env variables (records in session)

        1. pip install django-environ
        2. create .env file in settings.py
        3. environ.Env.read_env() is only for dev, production will read in terminal
        4. add env in python vevn use set=xx (to set) and set= (to unset)
        5. env('DEBUG') not find in env or file, it will print error

## postgres

        1.pip library: pip install psycopg2-binary
        2. Download postgres
        3. 設置環境變數
        C:\Program Files\PostgreSQL\14\bin
        4.
        For windows
        https://stackoverflow.com/questions/71538752/when-are-quotes-needed-in-env-file

        Use postgres 14 (Not version 15)
        https://www.cybertec-postgresql.com/en/error-permission-denied-schema-public/

        # CREATE DB
        createdb -U postgres djcrm

        # Write command (command will all start with # unless we quit it \q)
        psql -U postgres

        # CREATE ROLE
        CREATE USER djcrmuser WITH PASSWORD 'djcrm1234';
        # GRANT
        GRANT ALL PRIVILEGES ON DATABASE djcrm to djcrmuser;
        # QUIT
        \q

        #Activate postgres first and then run django

        SET READ_DOT_ENV_FILE=True
        pg_ctl -D "C:\Program Files\PostgreSQL\14\data" start
        pg_ctl -D "C:\Program Files\PostgreSQL\14\data" stop
        python manage.py makemigrations
        python manage.py migrate
        python manage.py runserver

## whitenoise (For hosting static files in python apps)

        1. pip install whitenoise
        2. settings.py => add "whitenoise.middleware.WhiteNoiseMiddleware",
        3. STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
        4. python manage.py collectstatic (settings.py => add STATIC_ROOT = "static_root")
        5. python manage.py --nostatic or settings.py => add "whitenoise.runserver_nostatic"
        (disable django runserver automatically takes over static file handling)
        (if css and images are manage correctly means it works)

## deploy on digital ocean (not tried yet due to price)

        https://testdriven.io/blog/django-digitalocean-app-platform/

        1. Use App platform
        2. Automated with github branches
        3. type: web service not static site
        4. plans: basic (starter only includes static sites)
        5. basic size: 1vCPU, 512 mb ram ($5 per month)
        6. set env variables
        7. add these in settings.py
        https://stackoverflow.com/questions/49166768/setting-secure-hsts-seconds-can-irreversibly-break-your-site
                if not DEBUG:
                        SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
                        SECURE_SSL_REDIRECT = True
                        SESSION_COOKIE_SECURE = True
                        CSRF_COOKIE_SECURE = True
                        SECURE_BROWSER_XSS_FILTER = True
                        SECURE_CONTENT_TYPE_NOSNIFF = True
                        SECURE_HSTS_SECONDS = 31536000  # 1 year
                        SECURE_HSTS_INCLUDE_SUBDOMAINS = True
                        SECURE_HSTS_PRELOAD = True
                        X_FRAME_OPTIONS = "DENY"

                        ALLOWED_HOSTS = ["*"]
        8. For deployment, we need to have gunicorn in requirements.txt
        pip install gunicorn
        gunicorn djcrm.wsgi:application

        9. Evertime we deploy something we need to run a bash file which includes
                1. python manage.py collectstatic --no-input
                2  python manage.py migrate
                3. gunicorn --worker-tmp-dir /dev/shm djcrm.wsgi
                7. chmod 777 runserver.sh

        ## create database
        1. the lowest price $15 per month
        2. trusted source: who can send request to the database

## email sending

        1. Before email sending, you must have your own domain
        2. email transaction, suggest using mailgun
        3. add these to the setting.py

                EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
                EMAIL_HOST = env("EMAIL_HOST") # "smtp.maingun.org"
                EMAIL_HOST_USER = env("EMAIL_HOST_USER") # "postmaster@mg.domain.com"
                EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
                EMAIL_USE_TLS = True
                EMAIL_PORT = env("EMAIL_PORT") #587
                DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL") # "yourname@mg.domain.com"

## custom domain

        # https://docs.digitalocean.com/products/networking/dns/how-to/add-domains/
        # digital ocean does not provide domain registration service, digital ocean lets you manage the domain’s DNS records with the control panel and API.
        # each project should add its own domain

## touch ups

        1. add some dynamic statement (if else in template)
        2. {% empty %} template tags (if the query set is empty we will output the below result of empty)

## welcome (Download using git)

        git clone https://github.com/justdjango/getting-started-with-django.git
        git checkout 48-start-of-intermediate
        git pull

## Following Along

        python -m venv env
        env\Scripts\activate
        pip install -r requirements.txt
        pip install psycopg2-binary -U
        pip freeze > requirements.txt
        SET READ_DOT_ENV_FILE=True
        pg_ctl -D "C:\Program Files\PostgreSQL\14\data" start
        python manage.py migrate
        python manage.py runserver

## Model Manager:

        # Method1

        [models.py]
        class LeadManager(models.Manager):
                def get_queryset(self):
                        return super().get_queryset()
                def get_age_below_50(self):
                return self.get_queryset().filter(age_lt=50)

        class Lead(models.Model):

                ...
                objects = LeadManager()


        [views.py]
        Lead.objects.get_age_below_50

        # Method2
        [models.py]
        class BlankLeadManager(models.Manager):
                def get_queryset(self):
                        return super().get_queryset().filter(category_isnull=True)

        class Lead(models.Model):

                ...
                blank_objects = BlankLeadManager()

        [views.py]
        Lead.objects.all()

## Model Admin

        fields: only show in the form
        list: show in the list view

        class LeadAdmin(admin.ModelAdmin):
        # fields = (
        #     'first_name',
        #     'last_name',
        # )

        list_display = ['first_name', 'last_name', 'age', 'email']
        list_display_links = ['first_name'] # links to the detail view
        list_editable = ['last_name']
        list_filter = ['category']
        search_fields = ['first_name', 'last_name', 'email']

## Form validation

        [forms.py]
        clean for all and clean_specific for specific field name
        from django.core.exceptions import ValidationError

        class LeadModelForm(forms.ModelForm):
                class Meta:
                        model = Lead
                        fields = (
                        'first_name',
                        'last_name',
                        'age',
                        'agent',
                        'description',
                        'phone_number',
                        'email',
                        )
                def clean_first_name(self):
                        data = self.cleaned_data['first_name']
                        if data!="Joe":
                                raise ValidationError("Your name is not Joe")
                        return data

                def clean(self):
                        pass

## Image field

        [models.py]
        profile_picture = models.ImageField(null=True, blank=True, upload_to="profile_pictures/")

        [settings.py]
        MEDIA_URL = '/media/'
        MEDIA_ROOT = "media_root"

        [urls.py]
        if settings.DEBUG:
                urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
                urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

        [.gitignore]
        add media_root

## Messages (show notification like the form is written correctly)

        [views.py]
        messages.success(self.request, "You have successfully created a lead")

        [templates\base.html]
        {% if messages %}
        <ul class="messages">
            {% for message in messages %}
            <li{% if message.tags %} class="{% if message.tags == 'success' %}bg-green-500 text-white{% endif %}"{% endif %}>{{ message }}</li>
            {% endfor %}
        </ul>
        {% endif %}

## Custom commands (running data, run cron job, check databse, send email etc)

        1. Go to apps (lead) create folder called management/commands/create_lead.py
        [create_lead.py]

        from django.core.management.base import BaseCommand


        class Command(BaseCommand):

        def add_arguments(self, parser):
                parser.add_argument('first_name', type=str)

        def handle(self, *args, **options):
                #print(options)
                print(options['first_name'])

        => python manage.py create_lead "Joe" => Joe

## Json response

        key point : list(Lead.objects.all().values())

        class LeadJsonView(generic.View):

                def get(self, request, *args, **kwargs):

                        qs = list(Lead.objects.all().values(
                        "first_name",
                        "last_name",
                        "age")
                        )

                        return JsonResponse({
                        "qs": qs,
                        })

## Logging

        [settings.py]
        1.
        LOGGING = {
                'version': 1,
                'disable_existing_loggers': False,
                'handlers': {
                        'console': {
                        'class': 'logging.StreamHandler',
                        },
                },
                'root': {
                        'handlers': ['console'],
                        'level': 'WARNING',
                },
        }

        [views.py]
        import logging
        logger.warning("This is a test warning")

## File Forms

        <form form method="post" enctype="multipart/form-data">{{ form|crispy }}</form>

## Rendering Images

        {% if lead.profile_picture %}
          <img
            class="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"
            src="{{ lead.profile_picture.url }}"
            alt=""
          />
        {% endif %}

## Followup Model

        [models.py] (file save in different folder)

        def handle_upload_follow_ups(instance, filename):
                return f"lead_followups/lead_{instance.lead.pk}/{filename}"

        class FollowUp(models.Model):
                lead = models.ForeignKey(Lead, related_name="followups", on_delete=models.CASCADE)
                date_added = models.DateTimeField(auto_now_add=True)
                notes = models.TextField(blank=True, null=True)
                file = models.FileField(null=True, blank=True, upload_to=handle_upload_follow_ups)

                def __str__(self):
                        return f"{self.lead.first_name} {self.lead.last_name}"

## Followup List and Create View

        [views.py]
        form_valid: is when you need to assign something in your field
        get_context_data: when adding data(FollowUpCreateView can also use get_context_data)
        download link:
                <a  href="{{ followup.file.url }}" download class="font-medium text-indigo-600 hover:text-indigo-500">
                  Download
                </a>

## Followup Update and Delete View

        self.kwargs is from url params

## CRM dashboard (filter can add muliple cond with comma)

        converted_in_past30 = Lead.objects.filter(
                organisation=user.userprofile,
                category=converted_category,
                converted_date__gte=thirty_days_ago
                ).count()

## Tailwind css improvements

        detail settings:https://django-tailwind.readthedocs.io/en/latest/installation.html

        cdn not for production cause reading a large info without using
        pip install django-tailwind

        [settings.py]
        INSTALLED_APPS  add 'tailwind'
        python manage.py tailwind init theme
        [settings.py]
        INSTALLED_APPS  add 'tailwind'

        INSTALLED_APPS  add TAILWIND_APP_NAME = 'theme'

        NPM_BIN_PATH = "C:/Program Files/nodejs/npm.cmd"
        INTERNAL_IPS = [
        "127.0.0.1",
        ]

        python manage.py tailwind install
        python manage.py tailwind start
        Delete theme\templates folder
        Delete static\css folder
        add {% load static tailwind_tags %} and {% tailwind_css %} in bse.html
        python manage.py tailwind build (minimize)

## Message Styling

        https://tailwindcss.com/docs/content-configuration
        add lines to tailwind.config.js (prevent changing)
        python manage.py tailwind start

## Create Leads from CSV (bulk import)

        class Command(BaseCommand):

        def add_arguments(self, parser):
                parser.add_argument('file_name', type=str)
                parser.add_argument('organisor_email', type=str)

        def handle(self, *args, **options):
                file_name = options['file_name']
                organisor_email = options['organisor_email']

                organisation = UserProfile.objects.get(user__email=organisor_email)

                with open(file_name, 'r') as read_obj:
                csv_reader = DictReader(read_obj)
                for row in csv_reader:
                        first_name = row['first_name']
                        last_name = row['last_name']
                        age = row['age']
                        email = row['email']

                        Lead.objects.create(
                        organisation=organisation,
                        first_name=first_name,
                        last_name=last_name,
                        age=age,
                        email=email,
                        )

## Deployment Improvements

        # add python manage.py migrate to cronjob before eaach new deploy

## Media Files

        # whitenoise does not handle media file
