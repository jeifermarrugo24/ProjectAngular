import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/users/users.service';
import { User } from '../models/user.model';
@Component({
  selector: 'user-list',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  error: string | null = null;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.getUsers().subscribe((res) => {
      if ('users' in res) {
        this.users = res.users;
      } else if ('error' in res) {
        this.error = res.error;
      }
    });

  }

}
 