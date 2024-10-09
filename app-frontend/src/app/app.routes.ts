import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/commons/home/home.component';
import { LoginComponent } from './components/commons/login/login.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
    {'path': '', 'redirectTo': 'home', 'pathMatch': 'full'},
    {'path': 'home', component: HomeComponent},
    {'path': 'login', component: LoginComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
