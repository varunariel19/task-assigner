import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html'
})
export class LandingComponent {

  appName = signal("T-Assigner")
  features = [
    {
      title: 'Simple Boards',
      desc: 'Kanban style boards to visualize work clearly.'
    },
    {
      title: 'Real-time Sync',
      desc: 'Collaborate with your team instantly.'
    },
    {
      title: 'Smart Analytics',
      desc: 'Track productivity and project progress.'
    }
  ];

  steps = [
    'Create your workspace',
    'Invite your team',
    'Start shipping faster'
  ];

  tasks = [
    'Design landing page',
    'Fix login bug',
    'Prepare sprint plan'
  ];
}