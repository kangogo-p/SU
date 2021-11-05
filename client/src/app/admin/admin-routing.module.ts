import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RootPage } from './0_root/root.page';
import { InventoryPage } from './1_inventory/inventory.page';
import { RoleGuard } from './role.guard';

const routes: Routes = [
  {
    path: 'admin',
    component: RootPage,
    canActivate: [RoleGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '0', // Invalid category id to be replaced with the id of the first category when it becomes available
      },
      { path: ':categoryId', component: InventoryPage },
    ],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
