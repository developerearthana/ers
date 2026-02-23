import { hasPermission, hasRole, hasAccessLevel } from '@/lib/rbac';

describe('RBAC - Role-Based Access Control', () => {
    describe('hasPermission', () => {
        it('should return true for admin users without customRole', () => {
            const user = { role: 'admin' };
            expect(hasPermission(user, 'any.permission')).toBe(true);
        });

        it('should return false for null or undefined user', () => {
            expect(hasPermission(null, 'user.create')).toBe(false);
            expect(hasPermission(undefined, 'user.create')).toBe(false);
        });

        it('should return false for user without customRole and not admin', () => {
            const user = { role: 'user' };
            expect(hasPermission(user, 'user.create')).toBe(false);
        });

        it('should return true for super admin with level >= 100', () => {
            const user = {
                customRole: {
                    name: 'Super Admin',
                    level: 100,
                    hierarchyLevel: 100,
                    permissions: []
                }
            };
            expect(hasPermission(user, 'any.permission')).toBe(true);
        });

        it('should return true for user with specific permission code', () => {
            const user = {
                customRole: {
                    name: 'Manager',
                    level: 50,
                    hierarchyLevel: 50,
                    permissions: ['user.create', 'user.read', 'user.update']
                }
            };
            expect(hasPermission(user, 'user.create')).toBe(true);
            expect(hasPermission(user, 'user.read')).toBe(true);
        });

        it('should return false for user without specific permission', () => {
            const user = {
                customRole: {
                    name: 'Viewer',
                    level: 10,
                    hierarchyLevel: 10,
                    permissions: ['user.read']
                }
            };
            expect(hasPermission(user, 'user.delete')).toBe(false);
        });

        it('should return true for user with wildcard permission', () => {
            const user = {
                customRole: {
                    name: 'Power User',
                    level: 80,
                    hierarchyLevel: 80,
                    permissions: ['*']
                }
            };
            expect(hasPermission(user, 'any.permission')).toBe(true);
        });

        it('should handle permission objects with code property', () => {
            const user = {
                customRole: {
                    name: 'Manager',
                    level: 50,
                    hierarchyLevel: 50,
                    permissions: [
                        { code: 'user.create', name: 'Create User' },
                        { code: 'user.read', name: 'Read User' }
                    ]
                }
            };
            expect(hasPermission(user, 'user.create')).toBe(true);
            expect(hasPermission(user, 'user.delete')).toBe(false);
        });

        it('should return false for user with empty permissions array', () => {
            const user = {
                customRole: {
                    name: 'Limited User',
                    level: 5,
                    hierarchyLevel: 5,
                    permissions: []
                }
            };
            expect(hasPermission(user, 'user.read')).toBe(false);
        });

        it('should return false when permissions is not an array', () => {
            const user = {
                customRole: {
                    name: 'Broken Role',
                    level: 10,
                    hierarchyLevel: 10,
                    permissions: null
                }
            };
            expect(hasPermission(user, 'user.read')).toBe(false);
        });

        describe('contextual rules - time restrictions', () => {
            beforeEach(() => {
                // Mock current time to 10:00 AM (600 minutes from midnight)
                jest.useFakeTimers();
                jest.setSystemTime(new Date('2026-01-12T10:00:00'));
            });

            afterEach(() => {
                jest.useRealTimers();
            });

            it('should allow access within allowed hours', () => {
                const user = {
                    customRole: {
                        name: 'Day Shift Worker',
                        level: 30,
                        hierarchyLevel: 30,
                        permissions: ['work.access'],
                        contextualRules: {
                            timeRestricted: true,
                            allowedHours: '09:00-17:00' // 9 AM to 5 PM
                        }
                    }
                };
                expect(hasPermission(user, 'work.access')).toBe(true);
            });

            it('should deny access outside allowed hours', () => {
                // Set time to 8:00 AM (before allowed hours)
                jest.setSystemTime(new Date('2026-01-12T08:00:00'));

                const user = {
                    customRole: {
                        name: 'Day Shift Worker',
                        level: 30,
                        hierarchyLevel: 30,
                        permissions: ['work.access'],
                        contextualRules: {
                            timeRestricted: true,
                            allowedHours: '09:00-17:00'
                        }
                    }
                };
                expect(hasPermission(user, 'work.access')).toBe(false);
            });

            it('should allow access when time restriction is disabled', () => {
                jest.setSystemTime(new Date('2026-01-12T22:00:00')); // 10 PM

                const user = {
                    customRole: {
                        name: 'Unrestricted User',
                        level: 30,
                        hierarchyLevel: 30,
                        permissions: ['work.access'],
                        contextualRules: {
                            timeRestricted: false,
                            allowedHours: '09:00-17:00'
                        }
                    }
                };
                expect(hasPermission(user, 'work.access')).toBe(true);
            });

            it('should allow access when no contextual rules exist', () => {
                const user = {
                    customRole: {
                        name: 'Normal User',
                        level: 30,
                        hierarchyLevel: 30,
                        permissions: ['work.access']
                    }
                };
                expect(hasPermission(user, 'work.access')).toBe(true);
            });
        });
    });

    describe('hasRole', () => {
        it('should return true for admin user with Admin role name', () => {
            const user = { role: 'admin' };
            expect(hasRole(user, 'Admin')).toBe(true);
        });

        it('should return false for admin user with non-Admin role name', () => {
            const user = { role: 'admin' };
            expect(hasRole(user, 'Manager')).toBe(false);
        });

        it('should return true when customRole name matches', () => {
            const user = {
                customRole: {
                    name: 'Manager',
                    level: 50,
                    hierarchyLevel: 50,
                    permissions: []
                }
            };
            expect(hasRole(user, 'Manager')).toBe(true);
        });

        it('should return false when customRole name does not match', () => {
            const user = {
                customRole: {
                    name: 'Viewer',
                    level: 10,
                    hierarchyLevel: 10,
                    permissions: []
                }
            };
            expect(hasRole(user, 'Manager')).toBe(false);
        });

        it('should return false for user without customRole and not admin', () => {
            const user = { role: 'user' };
            expect(hasRole(user, 'Manager')).toBe(false);
        });

        it('should return false for null user', () => {
            expect(hasRole(null, 'Manager')).toBe(false);
        });
    });

    describe('hasAccessLevel', () => {
        it('should return true for admin user when minLevel <= 100', () => {
            const user = { role: 'admin' };
            expect(hasAccessLevel(user, 100)).toBe(true);
            expect(hasAccessLevel(user, 50)).toBe(true);
        });

        it('should return false for admin user when minLevel > 100', () => {
            const user = { role: 'admin' };
            expect(hasAccessLevel(user, 101)).toBe(false);
        });

        it('should return true when user level meets minimum', () => {
            const user = {
                customRole: {
                    name: 'Manager',
                    level: 50,
                    hierarchyLevel: 50,
                    permissions: []
                }
            };
            expect(hasAccessLevel(user, 50)).toBe(true);
            expect(hasAccessLevel(user, 30)).toBe(true);
        });

        it('should return false when user level is below minimum', () => {
            const user = {
                customRole: {
                    name: 'Viewer',
                    level: 10,
                    hierarchyLevel: 10,
                    permissions: []
                }
            };
            expect(hasAccessLevel(user, 50)).toBe(false);
        });

        it('should return false for user without customRole and not admin', () => {
            const user = { role: 'user' };
            expect(hasAccessLevel(user, 10)).toBe(false);
        });

        it('should return false for null user', () => {
            expect(hasAccessLevel(null, 10)).toBe(false);
        });
    });
});
