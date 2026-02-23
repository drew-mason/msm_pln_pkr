import { CrossScopePrivilege } from '@servicenow/sdk/core'

CrossScopePrivilege({
    $id: Now.ID['a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'],
    operation: 'create',
    status: 'allowed',
    targetName: 'sys_user',
    targetScope: 'global',
    targetType: 'sys_db_object',
})
