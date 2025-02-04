import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/commons/home/home.component';
import { LoginComponent } from './components/commons/login/login.component';
import { NgModule } from '@angular/core';
import { NotFoundComponent } from './components/commons/not-found/not-found.component';
import {AddUserComponent} from "./components/admin/add-user/add-user.component";
import { DynamicPageComponent } from './components/commons/dynamic-page/dynamic-page.component';
import { ShowCardsComponent } from './components/admin/show-cards/show-cards.component';
import { ShowExchangeComponent } from './components/admin/show-exchange/show-exchange.component';
import { BalanceReductionComponent } from './components/admin/balance-reduction/balance-reduction.component';
import { ShowTransactionsComponent } from './components/user/show-transactions/show-transactions.component';
import { EditProfileComponent } from './components/user/edit-profile/edit-profile.component';
import { ReportTransComponent } from './components/admin/report-trans/report-trans.component';
import { ReportDetailsComponent } from './components/admin/report-details/report-details.component';
import { ReportAccountsComponent } from './components/admin/report-accounts/report-accounts.component';
import { ReportClosedComponent } from './components/admin/report-closed/report-closed.component';
import { ReportBlockedComponent } from './components/admin/report-blocked/report-blocked.component';

export const routes: Routes = [
    {'path': '', 'redirectTo': 'home', 'pathMatch': 'full'},
    {'path': 'home', component: HomeComponent},
    {'path': 'login', component: LoginComponent},
    {'path': 'add-accounts', component: AddUserComponent},
    {'path': 'page/:page', component: DynamicPageComponent },
    {'path': 'show-accounts', component: ShowCardsComponent},
    {'path': 'show-change', component: ShowExchangeComponent},
    {'path': 'balance-reduction', component: BalanceReductionComponent},
    {'path': 'show-transactions', component: ShowTransactionsComponent},
    {'path': 'edit', children: [
        {'path': 'profile', component: EditProfileComponent},
    ]},
    {'path': 'transactions', component: ReportTransComponent},
    {'path': 'blocked', component: ReportBlockedComponent},
    {'path': 'details', component: ReportDetailsComponent},
    {'path': 'report-accounts', component: ReportAccountsComponent},
    {'path': 'closed', component: ReportClosedComponent},
    { 'path': '**', component: NotFoundComponent },
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
