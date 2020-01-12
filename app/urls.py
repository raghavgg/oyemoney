"""oyemoney URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
# It will include all the views from views file
from .views import *

urlpatterns = [
        path('', index, name='index'),
        path('signup/', signup, name='signup'),
        path('signin/', signin, name='signin'),
        path('logout/', request_logout, name='logout'),
        path('update_master/', update_master, name='update_master'),
        path('master_data/', master_data, name='master_data'),
        path('update_52whigh/', update_52whigh, name='update_52whigh'),
        path('52whigh_data/', week_high_data, name='week_high_data'),
        path('update_bhav_copy/', update_bhav_copy, name='update_bhav_copy'),
]
