import re

with open('backend/src/modules/members/members.service.ts', 'r') as f:
    text = f.read()

# 1. Remove User import & injection
text = re.sub(r'import \{ User \} from \'../auth/entities/user\.entity\';\n', '', text)
text = re.sub(r'\s*@InjectRepository\(User\)\s*private userRepository: Repository<User>,', '', text)

# 2. Fix search queries (user.userRoles -> userRoles)
text = text.replace('user: { userRoles: { role: { name: query.role } } }', 'userRoles: { role: { name: query.role } }')
text = text.replace('user: { userRoles: { role: true } }', 'userRoles: { role: true }')

# 3. Fix create()
create_pattern = re.compile(r'const member = await manager\.save\(Member, manager\.create\(Member, \{(.*?)\}\)\);\s*const user = await manager\.save\(User, \{(.*?)\}\);\s*await manager\.save\(UserRole, \{', re.DOTALL)
def create_repl(m):
    member_args = m.group(1).strip()
    user_args = m.group(2).strip()
    
    auth_fields = []
    for line in user_args.split('\n'):
        if 'npk:' in line or 'memberId:' in line:
            continue
        auth_fields.append(line.strip())
    
    auth_str = '\n        '.join(auth_fields)
    
    return f'const member = await manager.save(Member, manager.create(Member, {{\n        {member_args},\n        {auth_str}\n      }}));\n\n      await manager.save(UserRole, {{'
text = create_pattern.sub(create_repl, text)

# 4. Fix userId -> memberId in UserRole save inside create()
text = re.sub(r'userId: user\.id,\s*roleId: memberRole\.id,', 'memberId: member.id,\n        roleId: memberRole.id,', text)

# 5. Fix update()
update_pattern = re.compile(r'if \(data\.status === \'inactive\'\) \{\s*await this\.userRepository\.update\(\{ npk: member\.npk \}, \{ isActive: false \}\);\s*\} else if \(data\.status === \'active\'\) \{\s*await this\.userRepository\.update\(\{ npk: member\.npk \}, \{ isActive: true \}\);\s*\}', re.DOTALL)
text = update_pattern.sub('data.isActive = data.status === "active";', text)

# 6. Fix resetPassword()
reset_pattern = re.compile(r'const user = await this\.userRepository\.findOne\(\{\s*where: \[\{ memberId: member\.id \}, \{ npk: member\.npk \}\],\s*\}\);\s*if \(!user\) throw new NotFoundException\(\'Akun login anggota tidak ditemukan\'\);', re.DOTALL)
text = reset_pattern.sub('', text)
text = re.sub(r'await this\.userRepository\.update\(user\.id, \{', 'await this.memberRepository.update(member.id, {', text)

# 7. Fix findOrCreateByNpk()
find_or_create_pattern = re.compile(r'member = await this\.memberRepository\.save\(member\);\s*const defaultPassword(.*?)\s*await this\.userRepository\.save\(\{(.*?)\}\);', re.DOTALL)
def find_create_repl(m):
    pass_decl = m.group(1)
    user_args = m.group(2)
    
    auth_fields = []
    for line in user_args.split('\n'):
        if 'npk:' in line or 'memberId:' in line or 'password:' in line or 'isActive:' in line or 'mustChangePassword:' in line:
            continue
        auth_fields.append(line.strip())
    
    return f'const defaultPassword{pass_decl}\n      member.password = hashedPassword;\n      member.mustChangePassword = true;\n      member.isActive = true;\n      member = await this.memberRepository.save(member);'
text = find_or_create_pattern.sub(find_create_repl, text)

# 8. Fix importFromExcel()
import_pattern = re.compile(r'if \(row\.status === \'inactive\'\) \{\s*await this\.userRepository\.update\(\{ npk: row\.npk \}, \{ isActive: false \}\);\s*\}', re.DOTALL)
text = import_pattern.sub('', text)
text = text.replace('status: row.status || existingMember.status,', 'status: row.status || existingMember.status,\n            isActive: (row.status || existingMember.status) === "active",')

# 9. Fix importFromExcel() else block
import_create_pattern = re.compile(r'const member = await this\.memberRepository\.save\(\{(.*?)\}\);\s*await this\.userRepository\.save\(\{(.*?)\}\);', re.DOTALL)
def import_create_repl(m):
    member_args = m.group(1).strip()
    user_args = m.group(2).strip()
    return f'const member = await this.memberRepository.save({{\n            {member_args},\n            password: hashedPassword,\n            mustChangePassword: true,\n            isActive: row.status !== "inactive",\n          }});'
text = import_create_pattern.sub(import_create_repl, text)

# 10. Fix confirmImport()
confirm_pattern = re.compile(r'await manager\.update\(\s*User,\s*\{ npk: data\.npk \},\s*\{ isActive: data\.status === \'active\' \},\s*\);', re.DOTALL)
text = confirm_pattern.sub('member.isActive = data.status === "active";', text)

confirm_create_pattern = re.compile(r'member = await manager\.save\(\s*Member,\s*manager\.create\(Member, data\),\s*\);\s*const user = await manager\.save\(User, \{(.*?)\}\);\s*await manager\.save\(UserRole, \{', re.DOTALL)
def confirm_create_repl(m):
    return f'data.password = passwordHash;\n              data.mustChangePassword = true;\n              data.isActive = data.status === "active";\n              member = await manager.save(Member, manager.create(Member, data));\n              await manager.save(UserRole, {{'
text = confirm_create_pattern.sub(confirm_create_repl, text)

text = re.sub(r'userId: user\.id,\s*roleId: memberRole\.id,', 'memberId: member.id,\n                roleId: memberRole.id,', text)

with open('backend/src/modules/members/members.service.ts', 'w') as f:
    f.write(text)
