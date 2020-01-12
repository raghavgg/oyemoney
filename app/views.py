from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect
import pandas as pd
from django.core.files.storage import FileSystemStorage
from django_pandas.io import read_frame
from .models import *
import os

# Create your views here.


def index(request):
    if request.user.is_authenticated:
        if request.POST:
            data_date = request.POST['bhav_copy_date']
            closing_price = int(request.POST['closing_price'])
            volume = int(request.POST['volume'])
            trades = int(request.POST['trades'])
            mapping_data = Mapping.objects.filter(mapping_date=data_date)
            df = read_frame(mapping_data)
            df['sum_cp'] = df[['cp_latest_yesterday', 'cp_latest_5d', 'cp_latest_2w', 'cp_latest_1m', 'cp_latest_3m']].sum(axis=1)
            df['sum_vd'] = df[['vd_latest_yesterday', 'vd_latest_5d', 'vd_latest_2w', 'vd_latest_1m', 'vd_latest_3m']].sum(axis=1)
            df['sum_td'] = df[['td_latest_yesterday', 'td_latest_5d', 'td_latest_2w', 'td_latest_1m', 'td_latest_3m']].sum(axis=1)
            df = df.loc[(df['sum_cp'] >= closing_price) & (df['sum_vd'] >= volume) & (df['sum_td'] >= trades)]
            #for isin_code in list(df['isin_code']):
            #    bhav_data = BhavCopy.objects.filter(isin_code=isin_code, copy_date=data_date)
            #    week_data = Weekhigh.objects.filter(security_code=bhav_data[0].security_code)
            #    security_master_data = SecurityMaster.objects.filter(isin=isin_code)
            #    print(security_master_data[0].company_name)
        return render(request, "index.html")

    else:
        return render(request, "signin.html")


def update_master(request):
    if request.user.is_authenticated:
        if request.POST:
            master_date = request.POST['master_date']
            excel_file = request.FILES['master_file']
            fs = FileSystemStorage()
            filename = fs.save(excel_file.name, excel_file)
            uploaded_file_url = fs.url(filename)
            df = pd.read_excel(io=excel_file.name, sheet_name='Data')
            SecurityMaster.objects.all().delete()
            sm_list = df.values.tolist()
            sm_list = sm_list[0:100]
            for tmp_list in sm_list:
                sm = SecurityMaster(master_date=master_date, company_name=tmp_list[1], isin=tmp_list[2], code1=tmp_list[3], code1_dummy=tmp_list[4], nse_code=tmp_list[5], nse_dummy=tmp_list[6], dummy1=tmp_list[7], dummy2=tmp_list[8], market_cap=tmp_list[9], category=tmp_list[10], sector=tmp_list[11], industry=tmp_list[12], country=tmp_list[13], currency='INR')
                sm.save()
            os.remove(excel_file.name)
            context = {"status": "success"}
            return render(request, "update_master.html", context)
        else:
            return render(request, "update_master.html")
    else:
        return render(request, "signin.html")


def update_52whigh(request):
    if request.user.is_authenticated:
        if request.POST:
            date_52whigh = request.POST['52whigh__date']
            excel_file = request.FILES['52whigh_file']
            fs = FileSystemStorage()
            filename = fs.save(excel_file.name, excel_file)
            filename_arr = filename.split('.')
            uploaded_file_url = fs.url(filename)
            df = pd.read_csv(excel_file.name)
            sm_list = df.values.tolist()
            sm_list = sm_list[0:100]
            Weekhigh.objects.all().delete()
            for tmp_list in sm_list:
                sm = Weekhigh(high_date=date_52whigh, security_code=tmp_list[0], security_name=tmp_list[1], ltp=tmp_list[2], week_high=tmp_list[3], prev_week_high=tmp_list[4], prev_week_high_date=tmp_list[5], all_time_high=tmp_list[6], all_time_high_date=tmp_list[7], group=tmp_list[8])
                sm.save()
            os.remove(excel_file.name)
            context = {"status": "success"}
            return render(request, "update_52weekhigh.html", context)
        else:
            return render(request, "update_52weekhigh.html")
    else:
        return render(request, "signin.html")


def update_bhav_copy(request):
    if request.user.is_authenticated:
        if request.POST:
            copy_date = request.POST['bhav_copy_date']
            excel_file = request.FILES['bhav_copy_file']
            fs = FileSystemStorage()
            filename = fs.save(excel_file.name, excel_file)
            filename_arr = filename.split('.')
            uploaded_file_url = fs.url(filename)
            df = pd.read_csv(excel_file.name)
            sm_list = df.values.tolist()
            sm_list = sm_list[0:100]
            for tmp_list in sm_list:
                bhav_previous = BhavCopy.objects.filter(isin_code=tmp_list[14], copy_date__lt=copy_date).order_by('-copy_date')
                df = read_frame(bhav_previous)
                if not df.empty:
                    df.close = df.close.astype(float)
                    df.no_of_shares = df.no_of_shares.astype(float)
                    df.no_trades = df.no_trades.astype(float)
                    cp_bhav_yesterday = True if float(tmp_list[7])-df.loc[0].close > 0 else False
                    cp_bhav_5d = True if float(tmp_list[7]) - df.loc[0:2].close.mean() > 0 else False
                    cp_bhav_2w = True if float(tmp_list[7]) - df.loc[0:2].close.mean() > 0 else False
                    cp_bhav_1m = True if float(tmp_list[7]) - df.loc[0:2].close.mean() > 0 else False
                    cp_bhav_3m = True if float(tmp_list[7]) - df.loc[0:2].close.mean() > 0 else False
                    cp_bhav_yesterday_pc = ((float(tmp_list[7])-df.loc[0].close.mean())/(float(tmp_list[7])+df.loc[0].close.mean()))*100
                    cp_bhav_5d_pc = ((float(tmp_list[7])-df.loc[0:2].close.mean())/(float(tmp_list[7])+df.loc[0:2].close.mean()))*100
                    cp_bhav_2w_pc = ((float(tmp_list[7])-df.loc[0:2].close.mean())/(float(tmp_list[7])+df.loc[0:2].close.mean()))*100
                    cp_bhav_1m_pc = ((float(tmp_list[7])-df.loc[0:2].close.mean())/(float(tmp_list[7])+df.loc[0:2].close.mean()))*100
                    cp_bhav_3m_pc = ((float(tmp_list[7])-df.loc[0:2].close.mean())/(float(tmp_list[7])+df.loc[0:2].close.mean()))*100
                    vd_bhav_yesterday = True if float(tmp_list[11])-df.loc[0].no_of_shares > 0 else False
                    vd_bhav_5d = True if float(tmp_list[11]) - df.loc[0:2].no_of_shares.mean() > 0 else False
                    vd_bhav_2w = True if float(tmp_list[11]) - df.loc[0:2].no_of_shares.mean() > 0 else False
                    vd_bhav_1m = True if float(tmp_list[11]) - df.loc[0:2].no_of_shares.mean() > 0 else False
                    vd_bhav_3m = True if float(tmp_list[11]) - df.loc[0:2].no_of_shares.mean() > 0 else False
                    vd_bhav_yesterday_pc = ((float(tmp_list[11])-df.loc[0].no_of_shares.mean())/(float(tmp_list[11])+df.loc[0].no_of_shares.mean()))*100
                    vd_bhav_5d_pc = ((float(tmp_list[11])-df.loc[0:2].no_of_shares.mean())/(float(tmp_list[11])+df.loc[0:2].no_of_shares.mean()))*100
                    vd_bhav_2w_pc = ((float(tmp_list[11])-df.loc[0:2].no_of_shares.mean())/(float(tmp_list[11])+df.loc[0:2].no_of_shares.mean()))*100
                    vd_bhav_1m_pc = ((float(tmp_list[11])-df.loc[0:2].no_of_shares.mean())/(float(tmp_list[11])+df.loc[0:2].no_of_shares.mean()))*100
                    vd_bhav_3m_pc = ((float(tmp_list[11])-df.loc[0:2].no_of_shares.mean())/(float(tmp_list[11])+df.loc[0:2].no_of_shares.mean()))*100
                    td_bhav_yesterday = True if float(tmp_list[10])-df.loc[0].no_trades > 0 else False
                    td_bhav_5d = True if float(tmp_list[10]) - df.loc[0:2].no_trades.mean() > 0 else False
                    td_bhav_2w = True if float(tmp_list[10]) - df.loc[0:2].no_trades.mean() > 0 else False
                    td_bhav_1m = True if float(tmp_list[10]) - df.loc[0:2].no_trades.mean() > 0 else False
                    td_bhav_3m = True if float(tmp_list[10]) - df.loc[0:2].no_trades.mean() > 0 else False
                    td_bhav_yesterday_pc = ((float(tmp_list[10])-df.loc[0].no_trades.mean())/(float(tmp_list[10])+df.loc[0].no_trades.mean()))*100
                    td_bhav_5d_pc = ((float(tmp_list[10])-df.loc[0:2].no_trades.mean())/(float(tmp_list[10])+df.loc[0:2].no_trades.mean()))*100
                    td_bhav_2w_pc = ((float(tmp_list[10])-df.loc[0:2].no_trades.mean())/(float(tmp_list[10])+df.loc[0:2].no_trades.mean()))*100
                    td_bhav_1m_pc = ((float(tmp_list[10])-df.loc[0:2].no_trades.mean())/(float(tmp_list[10])+df.loc[0:2].no_trades.mean()))*100
                    td_bhav_3m_pc = ((float(tmp_list[10])-df.loc[0:2].no_trades.mean())/(float(tmp_list[10])+df.loc[0:2].no_trades.mean()))*100
                    mp = Mapping(mapping_date=copy_date, isin_code=tmp_list[14], cp_latest_yesterday=cp_bhav_yesterday, cp_latest_5d=cp_bhav_5d, cp_latest_2w=cp_bhav_2w, cp_latest_1m=cp_bhav_1m, cp_latest_3m=cp_bhav_3m, cp_latest_yesterday_pc=cp_bhav_yesterday_pc, cp_latest_5d_pc=cp_bhav_5d_pc, cp_latest_2w_pc=cp_bhav_2w_pc, cp_latest_1m_pc=cp_bhav_1m_pc, cp_latest_3m_pc=cp_bhav_3m_pc, vd_latest_yesterday=vd_bhav_yesterday, vd_latest_5d=vd_bhav_5d, vd_latest_2w=vd_bhav_2w, vd_latest_1m=vd_bhav_1m, vd_latest_3m=vd_bhav_3m, vd_latest_yesterday_pc=vd_bhav_yesterday_pc, vd_latest_5d_pc=vd_bhav_5d_pc, vd_latest_2w_pc=vd_bhav_2w_pc, vd_latest_1m_pc=vd_bhav_1m_pc, vd_latest_3m_pc=vd_bhav_3m_pc, td_latest_yesterday=td_bhav_yesterday, td_latest_5d=td_bhav_5d, td_latest_2w=td_bhav_2w, td_latest_1m=td_bhav_1m, td_latest_3m=td_bhav_3m, td_latest_yesterday_pc=td_bhav_yesterday_pc, td_latest_5d_pc=td_bhav_5d_pc, td_latest_2w_pc=td_bhav_2w_pc, td_latest_1m_pc=td_bhav_1m_pc, td_latest_3m_pc=td_bhav_3m_pc)
                    mp.save()
                sm = BhavCopy(copy_date=copy_date, security_code=tmp_list[0], security_name=tmp_list[1], security_group=tmp_list[2], open=tmp_list[4], high=tmp_list[5], low=tmp_list[6], close=tmp_list[7], last=tmp_list[8], prevclose=tmp_list[9], no_trades=tmp_list[10], no_of_shares=tmp_list[11], net_turnover=tmp_list[12], isin_code=tmp_list[14])
                sm.save()
            os.remove(excel_file.name)
            context = {"status": "success"}
            return render(request, "update_bhav_copy.html", context)
        else:
            return render(request, "update_bhav_copy.html")
    else:
        return render(request, "signin.html")


def week_high_data(request):
    if request.user.is_authenticated:
        tmp_wh = Weekhigh.objects.all()
        context = {"wh": tmp_wh}
        return render(request, "52whigh.html", context)
    else:
        return render(request, "signin.html")


def master_data(request):
    if request.user.is_authenticated:
        tmp_sm = SecurityMaster.objects.all()
        context = {"sm": tmp_sm}
        return render(request, "master_data.html", context)
    else:
        return render(request, "signin.html")


def request_logout(request):
    if request.user.is_authenticated:
        logout(request)
    return HttpResponseRedirect('/')


def signup(request):
    return render(request, "signup.html")


def signin(request):
    username = password = ''
    if request.POST:
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return HttpResponseRedirect('/')

    return render(request, "signin.html")
