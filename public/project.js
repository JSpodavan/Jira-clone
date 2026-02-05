const initProjectPage = () => {
  const backButton = document.getElementById('back-button');
  const projectTitle = document.getElementById('project-title');
  const projectName = document.getElementById('project-name');
  const projectDescription = document.getElementById('project-description');
  const projectIdLabel = document.getElementById('project-id');
  const copyProjectIdButton = document.getElementById('copy-project-id');
  const editButton = document.getElementById('edit-project-button');
  const deleteButton = document.getElementById('delete-project-button');
  const membersContainer = document.getElementById('members-container');
  const membersCount = document.getElementById('members-count');
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');
  const requestsContainer = document.getElementById('requests-container');
  const tasksContainer = document.getElementById('tasks-container');
  const addMemberForm = document.getElementById('add-member-form');
  const memberUserId = document.getElementById('member-user-id');
  const memberRole = document.getElementById('member-role');
  const requestsSection = document.querySelector('.requests-section');
  const addMemberSection = document.querySelector('.add-member');
  const tasksSection = document.querySelector('.tasks-section');
  const createTaskButton = document.getElementById('create-task-button');

  const editModal = document.getElementById('edit-modal');
  const editModalClose = document.getElementById('edit-modal-close');
  const editCancel = document.getElementById('edit-cancel');
  const editForm = document.getElementById('edit-project-form');
  const editName = document.getElementById('edit-project-name');
  const editDescription = document.getElementById('edit-project-description');

  const errorModal = document.getElementById('error-modal');
  const errorMessage = document.getElementById('error-message');
  const errorClose = document.getElementById('error-modal-close');
  const errorOk = document.getElementById('error-ok');

  const taskModal = document.getElementById('task-modal');
  const taskModalClose = document.getElementById('task-modal-close');
  const taskClose = document.getElementById('task-close');
  const taskEdit = document.getElementById('task-edit');
  const taskSave = document.getElementById('task-save');
  const taskCancelEdit = document.getElementById('task-cancel-edit');
  const taskDelete = document.getElementById('task-delete');
  const taskTitle = document.getElementById('task-title');
  const taskDescription = document.getElementById('task-description');
  const taskDescriptionView = document.getElementById('task-description-view');
  const taskDescriptionEdit = document.getElementById('task-description-edit');
  const taskStatusView = document.getElementById('task-status-view');
  const taskStatusEdit = document.getElementById('task-status-edit');
  const taskPriorityView = document.getElementById('task-priority-view');
  const taskPriorityEdit = document.getElementById('task-priority-edit');
  const taskAssigneeView = document.getElementById('task-assignee-view');
  const taskAssigneeEdit = document.getElementById('task-assignee-edit');
  const taskReporter = document.getElementById('task-reporter');
  const commentsList = document.getElementById('comments-list');
  const addCommentForm = document.getElementById('add-comment-form');
  const commentInput = document.getElementById('comment-input');

  const createTaskModal = document.getElementById('create-task-modal');
  const createTaskClose = document.getElementById('create-task-close');
  const createTaskCancel = document.getElementById('create-task-cancel');
  const createTaskForm = document.getElementById('create-task-form');
  const taskTitleInput = document.getElementById('task-title-input');
  const taskDescriptionInput = document.getElementById('task-description-input');
  const taskStatusInput = document.getElementById('task-status-input');
  const taskPriorityInput = document.getElementById('task-priority-input');
  const taskAssigneeInput = document.getElementById('task-assignee-input');

  const editTaskModal = document.getElementById('edit-task-modal');
  const editTaskClose = document.getElementById('edit-task-close');
  const editTaskCancel = document.getElementById('edit-task-cancel');
  const editTaskForm = document.getElementById('edit-task-form');
  const editTaskDescription = document.getElementById('edit-task-description');
  const editTaskStatus = document.getElementById('edit-task-status');
  const editTaskPriority = document.getElementById('edit-task-priority');
  const editTaskAssignee = document.getElementById('edit-task-assignee');

  const changeRoleModal = document.getElementById('change-role-modal');
  const changeRoleClose = document.getElementById('change-role-close');
  const changeRoleCancel = document.getElementById('change-role-cancel');
  const changeRoleForm = document.getElementById('change-role-form');
  const memberNameDisplay = document.getElementById('member-name-display');
  const newRoleSelect = document.getElementById('new-role-select');

  let activeMember = null;

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');

  if (!projectId) {
    window.location.href = '/projects.html';
    return;
  }

  const showErrorModal = (message) => {
    errorMessage.textContent = message;
    errorModal.classList.add('visible');
  };

  const closeErrorModal = () => {
    errorModal.classList.remove('visible');
  };

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      window.location.href = '/reg.html';
      return true;
    }
    return false;
  };

  let currentUserRole = null;
  let activeTask = null;
  let isEditMode = false;
  let projectMembers = [];
  let allMembers = [];
  let currentPage = 1;
  const membersPerPage = 50;

  const applyRoleVisibility = () => {
    const isMemberOnly = currentUserRole === 'MEMBER';
    if (editButton) {
      editButton.style.display = isMemberOnly ? 'none' : '';
    }
    if (deleteButton) {
      deleteButton.style.display = isMemberOnly ? 'none' : '';
    }
    if (requestsSection) {
      requestsSection.style.display = isMemberOnly ? 'none' : '';
    }
    if (addMemberSection) {
      addMemberSection.style.display = isMemberOnly ? 'none' : '';
    }
    if (tasksSection) {
      tasksSection.style.display = '';
    }
    if (createTaskButton) {
      createTaskButton.style.display = isMemberOnly ? 'none' : '';
    }
  };

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Error loading project');
        return;
      }
      const data = await response.json();
      projectTitle.textContent = data.name ?? 'Project';
      projectName.textContent = data.name ?? 'Untitled';
      projectDescription.textContent = data.description || 'No description';
      projectIdLabel.textContent = data.id ?? projectId;
      currentUserRole = data.currentUserRole ?? null;
      applyRoleVisibility();
      if (currentUserRole !== 'MEMBER') {
        loadRequests();
      } else {
        requestsContainer.innerHTML = '';
      }
      editName.value = data.name ?? '';
      editDescription.value = data.description ?? '';
    } catch (error) {
      console.error('Load project error:', error);
      showErrorModal('Network error');
    }
  };

  const renderMembers = (members) => {
    const startIndex = (currentPage - 1) * membersPerPage;
    const endIndex = startIndex + membersPerPage;
    const pageMembers = members.slice(startIndex, endIndex);
    const totalPages = Math.ceil(members.length / membersPerPage);

    membersCount.textContent = `${members.length} member${members.length !== 1 ? 's' : ''}`;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage >= totalPages;

    membersContainer.innerHTML = '';
    if (!pageMembers || pageMembers.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No members';
      membersContainer.appendChild(empty);
      return;
    }

    pageMembers.forEach((member) => {
      const card = document.createElement('div');
      card.className = 'member-card';

      const info = document.createElement('div');
      info.className = 'member-info';

      const name = document.createElement('div');
      name.className = 'member-name';
      const user = member.user || {};
      name.textContent =
        user.name && user.surname
          ? `${user.name} ${user.surname}`
          : user.email || member.userId || 'User';

      const role = document.createElement('div');
      role.className = 'member-role';
      role.textContent = member.role ?? 'MEMBER';

      info.appendChild(name);
      info.appendChild(role);

      card.appendChild(info);

      if (currentUserRole && currentUserRole !== 'MEMBER') {
        const actions = document.createElement('div');
        actions.className = 'member-actions';
        
        const changeRoleButton = document.createElement('button');
        changeRoleButton.className = 'secondary small-button';
        changeRoleButton.textContent = 'Change Role';
        changeRoleButton.addEventListener('click', async () => {
          await changeMemberRole(member);
        });
        
        const removeButton = document.createElement('button');
        removeButton.className = 'ghost small-button';
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', async () => {
          await removeMember(member.id);
        });
        
        actions.appendChild(changeRoleButton);
        actions.appendChild(removeButton);
        card.appendChild(actions);
      }
      membersContainer.appendChild(card);
    });
  };

  const loadMembers = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Error loading members');
        return;
      }
      const data = await response.json().catch(() => []);
      allMembers = data;
      projectMembers = data;
      currentPage = 1;
      renderMembers(allMembers);
    } catch (error) {
      console.error('Load members error:', error);
      showErrorModal('Network error');
    }
  };

  const renderRequests = (requests) => {
    requestsContainer.innerHTML = '';
    if (!requests || requests.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No requests';
      requestsContainer.appendChild(empty);
      return;
    }

    requests.forEach((request) => {
      const card = document.createElement('div');
      card.className = 'request-card';

      const info = document.createElement('div');
      info.className = 'member-info';

      const name = document.createElement('div');
      name.className = 'member-name';
      const user = request.user || {};
      name.textContent =
        user.name && user.surname
          ? `${user.name} ${user.surname}`
          : user.email || request.userId || 'User';

      const role = document.createElement('div');
      role.className = 'member-role';
      role.textContent = 'Join request';

      info.appendChild(name);
      info.appendChild(role);

      const actions = document.createElement('div');
      actions.className = 'request-actions';

      const acceptButton = document.createElement('button');
      acceptButton.className = 'primary';
      acceptButton.textContent = 'Accept';
      acceptButton.addEventListener('click', async () => {
        await respondToRequest(request.id, 'accept');
      });

      const rejectButton = document.createElement('button');
      rejectButton.className = 'ghost';
      rejectButton.textContent = 'Reject';
      rejectButton.addEventListener('click', async () => {
        await respondToRequest(request.id, 'reject');
      });

      actions.appendChild(acceptButton);
      actions.appendChild(rejectButton);

      card.appendChild(info);
      card.appendChild(actions);
      requestsContainer.appendChild(card);
    });
  };

  const loadRequests = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/Invitation`);
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Error loading requests');
        return;
      }
      const data = await response.json().catch(() => []);
      renderRequests(data);
    } catch (error) {
      console.error('Load requests error:', error);
      showErrorModal('Network error');
    }
  };

  const renderTasks = (tasks) => {
    tasksContainer.innerHTML = '';
    if (!tasks || tasks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No tasks';
      tasksContainer.appendChild(empty);
      return;
    }

    tasks.forEach((task) => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.addEventListener('click', () => openTaskModal(task));

      const title = document.createElement('div');
      title.className = 'task-title';
      title.textContent = task.title ?? 'Untitled';

      const meta = document.createElement('div');
      meta.className = 'task-meta';
      meta.textContent = `${task.status ?? '—'} · ${task.priority ?? '—'}`;

      card.appendChild(title);
      card.appendChild(meta);
      tasksContainer.appendChild(card);
    });
  };

  const loadTasks = async () => {
    try {
      const response = await fetch(`/api/task/project/${projectId}`);
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Error loading tasks');
        return;
      }
      const data = await response.json().catch(() => []);
      renderTasks(data);
    } catch (error) {
      console.error('Load tasks error:', error);
      showErrorModal('Network error');
    }
  };

  const openTaskModal = async (task) => {
    activeTask = task;
    isEditMode = false;
    taskTitle.textContent = task.title ?? 'Untitled';
    taskDescription.textContent = task.description || 'No description';
    
    const statusBadge = `<span class="task-status-badge ${task.status}">${task.status ?? '—'}</span>`;
    taskStatusView.innerHTML = statusBadge;
    
    const priorityBadge = `<span class="task-priority-badge ${task.priority}">${task.priority ?? '—'}</span>`;
    taskPriorityView.innerHTML = priorityBadge;
    
    const assignee = task.assignee || {};
    const reporter = task.reporter || {};
    taskAssigneeView.textContent =
      assignee.name && assignee.surname
        ? `${assignee.name} ${assignee.surname}`
        : assignee.email || '—';
    taskReporter.textContent =
      reporter.name && reporter.surname
        ? `${reporter.name} ${reporter.surname}`
        : reporter.email || '—';
    
    taskDescriptionEdit.value = task.description || '';
    taskStatusEdit.value = task.status || 'TODO';
    taskPriorityEdit.value = task.priority || 'MEDIUM';
    taskAssigneeEdit.value = task.assignee?.id || '';
    
    taskDescriptionView.classList.remove('hidden');
    taskDescriptionEdit.classList.add('hidden');
    taskStatusView.classList.remove('hidden');
    taskStatusEdit.classList.add('hidden');
    taskPriorityView.classList.remove('hidden');
    taskPriorityEdit.classList.add('hidden');
    taskAssigneeView.classList.remove('hidden');
    taskAssigneeEdit.classList.add('hidden');
    
    if (currentUserRole === 'MEMBER') {
      taskEdit.style.display = 'none';
      taskDelete.style.display = 'none';
    } else {
      taskEdit.style.display = '';
      taskDelete.style.display = '';
    }
    taskSave.classList.add('hidden');
    taskCancelEdit.classList.add('hidden');
    
    await loadComments();
    taskModal.classList.add('visible');
  };

  const closeTaskModal = () => {
    isEditMode = false;
    taskModal.classList.remove('visible');
  };

  const enableEditMode = () => {
    isEditMode = true;
    taskDescriptionView.classList.add('hidden');
    taskDescriptionEdit.classList.remove('hidden');
    taskStatusView.classList.add('hidden');
    taskStatusEdit.classList.remove('hidden');
    taskPriorityView.classList.add('hidden');
    taskPriorityEdit.classList.remove('hidden');
    taskAssigneeView.classList.add('hidden');
    taskAssigneeEdit.classList.remove('hidden');
    
    taskEdit.classList.add('hidden');
    taskDelete.classList.add('hidden');
    taskClose.classList.add('hidden');
    taskSave.classList.remove('hidden');
    taskCancelEdit.classList.remove('hidden');
  };

  const disableEditMode = () => {
    isEditMode = false;
    taskDescriptionView.classList.remove('hidden');
    taskDescriptionEdit.classList.add('hidden');
    taskStatusView.classList.remove('hidden');
    taskStatusEdit.classList.add('hidden');
    taskPriorityView.classList.remove('hidden');
    taskPriorityEdit.classList.add('hidden');
    taskAssigneeView.classList.remove('hidden');
    taskAssigneeEdit.classList.add('hidden');
    
    taskEdit.classList.remove('hidden');
    taskDelete.classList.remove('hidden');
    taskClose.classList.remove('hidden');
    taskSave.classList.add('hidden');
    taskCancelEdit.classList.add('hidden');
  };

  const saveTaskChanges = async () => {
    if (!activeTask) return;
    
    const payload = {};
    const description = taskDescriptionEdit.value.trim();
    const status = taskStatusEdit.value;
    const priority = taskPriorityEdit.value;
    const assigneeId = taskAssigneeEdit.value.trim();
    
    if (description.length > 0) {
      payload.description = description;
    }
    if (status) {
      payload.status = status;
    }
    if (priority) {
      payload.priority = priority;
    }
    if (assigneeId.length > 0) {
      payload.assigneeId = assigneeId;
    }
    
    try {
      const response = await fetch(`/api/task/${activeTask.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        showErrorModal(data?.message ?? 'Error updating task');
        return;
      }
      
      const updatedTask = await response.json();
      activeTask = updatedTask;
      
      taskDescription.textContent = updatedTask.description || 'No description';
      
      const statusBadge = `<span class="task-status-badge ${updatedTask.status}">${updatedTask.status ?? '—'}</span>`;
      taskStatusView.innerHTML = statusBadge;
      
      const priorityBadge = `<span class="task-priority-badge ${updatedTask.priority}">${updatedTask.priority ?? '—'}</span>`;
      taskPriorityView.innerHTML = priorityBadge;
      
      const assignee = updatedTask.assignee || {};
      taskAssigneeView.textContent =
        assignee.name && assignee.surname
          ? `${assignee.name} ${assignee.surname}`
          : assignee.email || '—';
      
      disableEditMode();
      await loadTasks();
    } catch (error) {
      console.error('Update task error:', error);
      showErrorModal('Network error');
    }
  };

  const openCreateTaskModal = () => {
    taskTitleInput.value = '';
    taskDescriptionInput.value = '';
    taskStatusInput.value = 'TODO';
    taskPriorityInput.value = 'MEDIUM';
    
    taskAssigneeInput.innerHTML = '<option value="">Select assignee</option>';
    projectMembers.forEach(member => {
      const user = member.user || {};
      const displayName = user.name && user.surname 
        ? `${user.name} ${user.surname}` 
        : user.email || 'User';
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = displayName;
      taskAssigneeInput.appendChild(option);
    });
    
    createTaskModal.classList.add('visible');
  };

  const closeCreateTaskModal = () => {
    createTaskModal.classList.remove('visible');
  };

  const openEditTaskModal = () => {
    if (!activeTask) {
      return;
    }
    editTaskDescription.value = activeTask.description || '';
    editTaskStatus.value = activeTask.status || 'TODO';
    editTaskPriority.value = activeTask.priority || 'MEDIUM';
    editTaskAssignee.value = activeTask.assignee?.id || '';
    editTaskModal.classList.add('visible');
  };

  const closeEditTaskModal = () => {
    editTaskModal.classList.remove('visible');
  };

  const respondToRequest = async (invitationId, action) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/Invitation/${invitationId}/${action}`,
        { method: 'POST' },
      );
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Error processing request');
        return;
      }
      await loadRequests();
      await loadMembers();
    } catch (error) {
      console.error('Respond request error:', error);
      showErrorModal('Network error');
    }
  };

  const removeMember = async (memberId) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/members/${memberId}`,
        { method: 'DELETE' },
      );
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Error removing member');
        return;
      }
      await loadMembers();
    } catch (error) {
      console.error('Remove member error:', error);
      showErrorModal('Network error');
    }
  };

  const changeMemberRole = async (member) => {
    activeMember = member;
    const user = member.user || {};
    const displayName = user.name && user.surname 
      ? `${user.name} ${user.surname}` 
      : user.email || 'User';
    
    memberNameDisplay.textContent = `${displayName} (${member.role})`;
    
    newRoleSelect.innerHTML = '<option value="">Select role</option>';
    
    const roles = currentUserRole === 'MANAGER' 
      ? ['MEMBER'] 
      : ['OWNER', 'MANAGER', 'MEMBER'];
    
    roles.forEach(role => {
      const option = document.createElement('option');
      option.value = role;
      option.textContent = role;
      if (role === member.role) {
        option.disabled = true;
        option.textContent += ' (current)';
      }
      newRoleSelect.appendChild(option);
    });
    
    changeRoleModal.classList.add('visible');
  };

  const closeChangeRoleModal = () => {
    changeRoleModal.classList.remove('visible');
    activeMember = null;
  };

  const openEditModal = () => {
    editModal.classList.add('visible');
  };

  const closeEditModal = () => {
    editModal.classList.remove('visible');
  };

  backButton.addEventListener('click', () => {
    window.location.href = '/projects.html';
  });

  document.querySelector('.avatar').addEventListener('click', () => {
    window.location.href = '/profile.html';
  });

  copyProjectIdButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(projectId);
    } catch (error) {
      console.error('Copy project id error:', error);
      showErrorModal('Failed to copy ID');
    }
  });

  editButton.addEventListener('click', openEditModal);
  editModalClose.addEventListener('click', closeEditModal);
  editCancel.addEventListener('click', closeEditModal);

  errorClose.addEventListener('click', closeErrorModal);
  errorOk.addEventListener('click', closeErrorModal);

  prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderMembers(allMembers);
    }
  });

  nextPageButton.addEventListener('click', () => {
    const totalPages = Math.ceil(allMembers.length / membersPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderMembers(allMembers);
    }
  });
  taskModalClose.addEventListener('click', closeTaskModal);
  taskClose.addEventListener('click', closeTaskModal);
  taskEdit.addEventListener('click', enableEditMode);
  taskSave.addEventListener('click', saveTaskChanges);
  taskCancelEdit.addEventListener('click', disableEditMode);
  taskDelete.addEventListener('click', async () => {
    if (!activeTask) {
      return;
    }
    const confirmed = window.confirm('Delete task?');
    if (!confirmed) {
      return;
    }
    try {
      const response = await fetch(
        `/api/task/${projectId}/${activeTask.id}`,
        { method: 'DELETE' },
      );
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Error deleting task');
        return;
      }
      closeTaskModal();
      await loadTasks();
    } catch (error) {
      console.error('Delete task error:', error);
      showErrorModal('Network error');
    }
  });
  createTaskButton.addEventListener('click', openCreateTaskModal);
  createTaskClose.addEventListener('click', closeCreateTaskModal);
  createTaskCancel.addEventListener('click', closeCreateTaskModal);
  editTaskClose.addEventListener('click', closeEditTaskModal);
  editTaskCancel.addEventListener('click', closeEditTaskModal);

  changeRoleClose.addEventListener('click', closeChangeRoleModal);
  changeRoleCancel.addEventListener('click', closeChangeRoleModal);

  changeRoleForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeMember) return;
    
    const newRole = newRoleSelect.value;
    if (!newRole) return;
    
    try {
      const response = await fetch(
        `/api/projects/${projectId}/members/${activeMember.id}/role`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        },
      );
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Error changing role');
        return;
      }
      closeChangeRoleModal();
      await loadMembers();
    } catch (error) {
      console.error('Change role error:', error);
      showErrorModal('Network error');
    }
  });

  deleteButton.addEventListener('click', async () => {
    const confirmed = window.confirm('Delete project?');
    if (!confirmed) {
      return;
    }
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Error deleting project');
        return;
      }
      window.location.href = '/projects.html';
    } catch (error) {
      console.error('Delete project error:', error);
      showErrorModal('Network error');
    }
  });

  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = editName.value.trim();
    const description = editDescription.value.trim();
    const payload = {};
    if (name.length > 0) {
      payload.name = name;
    }
    if (description.length > 0) {
      payload.description = description;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Error updating project');
        return;
      }
      closeEditModal();
      await loadProject();
    } catch (error) {
      console.error('Update project error:', error);
      showErrorModal('Network error');
    }
  });

  addMemberForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const userId = memberUserId.value.trim();
    const role = memberRole.value;
    if (!userId) {
      showErrorModal('User ID cannot be empty');
      return;
    }
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
      });
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        showErrorModal(data?.message ?? 'Error adding member');
        return;
      }
      memberUserId.value = '';
      await loadMembers();
    } catch (error) {
      console.error('Add member error:', error);
      showErrorModal('Network error');
    }
  });

  createTaskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const status = taskStatusInput.value;
    const priority = taskPriorityInput.value;
    const assigneeId = taskAssigneeInput.value;
    if (!title || !assigneeId) {
      showErrorModal('Title and Assignee are required');
      return;
    }
    try {
      const response = await fetch(`/api/task/${projectId}/createTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          assigneeId,
        }),
      });
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        showErrorModal(data?.message ?? 'Error creating task');
        return;
      }
      closeCreateTaskModal();
      await loadTasks();
    } catch (error) {
      console.error('Create task error:', error);
      showErrorModal('Network error');
    }
  });

  editTaskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeTask) {
      return;
    }
    const payload = {};
    const description = editTaskDescription.value.trim();
    const status = editTaskStatus.value;
    const priority = editTaskPriority.value;
    const assigneeId = editTaskAssignee.value.trim();
    if (description.length > 0) {
      payload.description = description;
    }
    if (status) {
      payload.status = status;
    }
    if (priority) {
      payload.priority = priority;
    }
    if (assigneeId.length > 0) {
      payload.assigneeId = assigneeId;
    }
    try {
      const response = await fetch(`/api/task/${activeTask.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        showErrorModal(data?.message ?? 'Error updating task');
        return;
      }
      closeEditTaskModal();
      closeTaskModal();
      await loadTasks();
    } catch (error) {
      console.error('Update task error:', error);
      showErrorModal('Network error');
    }
  });

  const init = async () => {
    await loadProject();
    await loadMembers();
    await loadTasks();
  };

  const loadComments = async () => {
    if (!activeTask) return;
    try {
      const response = await fetch(`/api/task/${projectId}/${activeTask.id}/comments`);
      if (handleUnauthorized(response)) return;
      if (!response.ok) {
        showErrorModal('Error loading comments');
        return;
      }
      const comments = await response.json();
      renderComments(comments);
    } catch (error) {
      console.error('Load comments error:', error);
      showErrorModal('Network error');
    }
  };

  const renderComments = (comments) => {
    commentsList.innerHTML = '';
    if (!comments || comments.length === 0) {
      commentsList.innerHTML = '<div class="empty-state">No comments</div>';
      return;
    }
    comments.forEach(comment => {
      const commentCard = document.createElement('div');
      commentCard.className = 'comment-card';
      
      const author = comment.author || {};
      const authorName = author.name && author.surname 
        ? `${author.name} ${author.surname}` 
        : author.email || 'User';
      
      const commentHeader = document.createElement('div');
      commentHeader.className = 'comment-header';
      commentHeader.innerHTML = `<strong>${authorName}</strong>`;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'comment-delete-btn';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.title = 'Delete comment';
      deleteBtn.addEventListener('click', async () => {
        await deleteComment(comment.id);
      });
      commentHeader.appendChild(deleteBtn);
      
      const commentBody = document.createElement('div');
      commentBody.className = 'comment-body';
      commentBody.textContent = comment.body;
      
      commentCard.appendChild(commentHeader);
      commentCard.appendChild(commentBody);
      
      commentsList.appendChild(commentCard);
    });
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`/api/task/comment/${commentId}`, {
        method: 'DELETE'
      });
      if (handleUnauthorized(response)) return;
      if (!response.ok) {
        showErrorModal('Error deleting comment');
        return;
      }
      await loadComments();
    } catch (error) {
      console.error('Delete comment error:', error);
      showErrorModal('Network error');
    }
  };

  addCommentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const comment = commentInput.value.trim();
    if (!comment) return;
    
    try {
      const response = await fetch(`/api/task/${projectId}/${activeTask.id}/comment/createComment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      });
      if (handleUnauthorized(response)) return;
      if (!response.ok) {
        showErrorModal('Error adding comment');
        return;
      }
      commentInput.value = '';
      await loadComments();
    } catch (error) {
      console.error('Add comment error:', error);
      showErrorModal('Network error');
    }
  });

  init();
};

window.addEventListener('DOMContentLoaded', initProjectPage);

