import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/commons/home/home.component';
import { LoginComponent } from './components/commons/login/login.component';
import { NgModule } from '@angular/core';
import { NotFoundComponent } from './components/commons/not-found/not-found.component';
import {AddUserComponent} from "./components/admin/add-user/add-user.component";

export const routes: Routes = [
    {'path': '', 'redirectTo': 'home', 'pathMatch': 'full'},
    {'path': 'home', component: HomeComponent},
    {'path': 'login', component: LoginComponent},
    {'path': 'add-accounts', component: AddUserComponent},
    { 'path': '**', component: NotFoundComponent }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
