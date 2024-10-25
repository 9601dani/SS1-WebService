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

export const routes: Routes = [
    {'path': '', 'redirectTo': 'home', 'pathMatch': 'full'},
    {'path': 'home', component: HomeComponent},
    {'path': 'login', component: LoginComponent},
    {'path': 'add-accounts', component: AddUserComponent},
    {'path': 'page/:page', component: DynamicPageComponent },
    {'path': 'show-accounts', component: ShowCardsComponent},
    {'path': 'show-change', component: ShowExchangeComponent},
    {'path': 'balance-reduction', component: BalanceReductionComponent},
    { 'path': '**', component: NotFoundComponent },
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
