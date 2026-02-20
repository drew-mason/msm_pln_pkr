import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    app_menu_planning_poker: {
                        table: 'sys_app_application'
                        id: '3931fc1d1d114bf3a2cda21e0735b002'
                    }
                    auto_update_session_status: {
                        table: 'sys_script'
                        id: '4819105fa3de414cb449d99e87ad2782'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: '06387b2f5fd6457bac96006a65042c7a'
                    }
                    br_session_state_manager: {
                        table: 'sys_script'
                        id: '86d5ba2e2d834352ab32d4d84a006068'
                    }
                    fibonacci_method: {
                        table: 'x_902080_planningw_scoring_method'
                        id: '4b30e1c799c0469aabb6fb5427b4ec60'
                    }
                    module_join_session: {
                        table: 'sys_app_module'
                        id: 'b66ec9e2a2e44ca3b4de45cfd129718b'
                    }
                    module_planning_sessions: {
                        table: 'sys_app_module'
                        id: 'd799d184ad8247558024aeb557026ae3'
                    }
                    module_scoring_methods: {
                        table: 'sys_app_module'
                        id: 'b93dc8c334d144f2850e77b8801b5fa9'
                    }
                    module_session_management: {
                        table: 'sys_app_module'
                        id: '3c1147348c334aafb5d216fe17ad0b86'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'b8f02cf4241f425f9740e214282c7c1e'
                    }
                    powers_method: {
                        table: 'x_902080_planningw_scoring_method'
                        id: '185391bad45c45e3982746055b0e68ed'
                    }
                    si_demo_session_ajax: {
                        table: 'sys_script_include'
                        id: '2d6a5eb3e6494ad6845d0df0fdfa4bc2'
                    }
                    si_permissions_admin_ajax: {
                        table: 'sys_script_include'
                        id: '0b9bb5526b264167801ae7e36975568c'
                    }
                    si_planning_poker_ajax: {
                        table: 'sys_script_include'
                        id: '702e5c09c97d485ca9ebbad73c3fdda3'
                    }
                    si_planning_poker_security: {
                        table: 'sys_script_include'
                        id: 'fdbbef4a4bbb48a1b7e1a29c8c66988c'
                    }
                    si_planning_poker_session_ajax: {
                        table: 'sys_script_include'
                        id: '67922f4bc3384e138bf593d3b0dc85dd'
                    }
                    si_planning_poker_story_ajax: {
                        table: 'sys_script_include'
                        id: '61902bb36d0c404fb14bb947d6181f11'
                    }
                    si_planning_poker_test_runner: {
                        table: 'sys_script_include'
                        id: '68081b8f6dfb4cb8abeddee0db091cf7'
                    }
                    si_planning_poker_vote_utils: {
                        table: 'sys_script_include'
                        id: '9b3d1a41bbda4dbea3a6ad18927d147e'
                    }
                    si_planning_poker_voting_ajax: {
                        table: 'sys_script_include'
                        id: 'c6c12b5a18484d4a96133e60fa11132b'
                    }
                    si_presenter_management_ajax: {
                        table: 'sys_script_include'
                        id: 'd354345096ad4ae88101da801879eeb3'
                    }
                    si_session_management_ajax: {
                        table: 'sys_script_include'
                        id: 'f7ac41c1e806483f8c810a5b78a0be8e'
                    }
                    si_session_participant_ajax: {
                        table: 'sys_script_include'
                        id: '1ee5742843c24b7ba26caefcfbede46f'
                    }
                    si_session_statistics_ajax: {
                        table: 'sys_script_include'
                        id: '05fe9fd45a1747cab4f4c16a5201c0fe'
                    }
                    simple_method: {
                        table: 'x_902080_planningw_scoring_method'
                        id: '5a52126ffe744efea471fdba39e82b2f'
                    }
                    'src_server_auto-update-session-status_js': {
                        table: 'sys_module'
                        id: '0b693f9bb5ac42298ffcfcccc972f7cc'
                    }
                    'src_server_script-includes_DemoSessionAjax_js': {
                        table: 'sys_module'
                        id: 'a0a68806ee744f538922dd71b3642827'
                    }
                    'src_server_script-includes_PermissionsAdminAjax_js': {
                        table: 'sys_module'
                        id: '56e7cef4f1964307a5030d00937ba9b2'
                    }
                    'src_server_script-includes_PlanningPokerAjax_js': {
                        table: 'sys_module'
                        id: 'e5f92146029d49fba0d6454506953e62'
                    }
                    'src_server_script-includes_PlanningPokerSecurity_js': {
                        table: 'sys_module'
                        id: '8d5c4fee21d14a63bfe85a055ff147f0'
                    }
                    'src_server_script-includes_PlanningPokerSessionAjax_js': {
                        table: 'sys_module'
                        id: 'b1f1e40e0d7943e285b390451df197d2'
                    }
                    'src_server_script-includes_PlanningPokerStoryAjax_js': {
                        table: 'sys_module'
                        id: 'ab4169e44a1f4663b7e634b3f607ae96'
                    }
                    'src_server_script-includes_PlanningPokerTestRunner_js': {
                        table: 'sys_module'
                        id: 'da2f47d0286f46c888b059e1a2ce83d3'
                    }
                    'src_server_script-includes_PlanningPokerVoteUtils_js': {
                        table: 'sys_module'
                        id: 'd57b88b938334a67972f6c0a18415f9a'
                    }
                    'src_server_script-includes_PlanningPokerVotingAjax_js': {
                        table: 'sys_module'
                        id: '61bf8c0e51024b8d80b5131218e0ac8e'
                    }
                    'src_server_script-includes_PresenterManagementAjax_js': {
                        table: 'sys_module'
                        id: '65303207186b419a8d839912a3c41620'
                    }
                    'src_server_script-includes_SessionManagementAjax_js': {
                        table: 'sys_module'
                        id: 'd217aa5e1a5b4c9bafea7affc26c6395'
                    }
                    'src_server_script-includes_SessionParticipantAjax_js': {
                        table: 'sys_module'
                        id: '6bdbfe42015d4e7ebb70e4918f7c9be7'
                    }
                    'src_server_script-includes_SessionStatisticsAjax_js': {
                        table: 'sys_module'
                        id: 'c95a35a507ce497ba97c5177a43cafc8'
                    }
                    'src_server_session-state-manager_js': {
                        table: 'sys_module'
                        id: 'cd975e72279b4215997f84deaca68ced'
                    }
                    tshirt_method: {
                        table: 'x_902080_planningw_scoring_method'
                        id: '3b6c0cf5770b4c6c8d271dd830ef6b20'
                    }
                    ui_page_join: {
                        table: 'sys_ui_page'
                        id: 'f565af85e02649bc800ed15e7effbb40'
                    }
                    ui_page_session_management: {
                        table: 'sys_ui_page'
                        id: '96305f4890de427e8950194dde2542e7'
                    }
                    ui_page_session_statistics: {
                        table: 'sys_ui_page'
                        id: '2764b67d19014292baf1d9fc7cf30194'
                    }
                    ui_page_voting_interface: {
                        table: 'sys_ui_page'
                        id: '28f0352cd49641de914c74b478af1d02'
                    }
                }
                composite: [
                    {
                        table: 'sys_documentation'
                        id: '010d8ef33e9a47b584046b1324290b7e'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'scoring_method'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '021c6b3e58834cf9828c5a5004937d6a'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'status'
                            value: 'live'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0325aef875564984a6b26bf8c9150d94'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'presenter'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0c97e6d6602943c7ab94ea86ee6b5d84'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                            element: 'allow_custom_values'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0e529b433c7f45919f0d1f67a575860d'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'vote_time'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '104f90e361c6491da07f6e4320e17115'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'status'
                            value: 'completed'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '10b0e5830bfe44fead32dd1b39ab39fc'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'presenter'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1107351f0e4d465bac5455c9d240490e'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'story_description'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '1108fe59ed0a4e358b39a8c046118c20'
                        key: {
                            name: 'x_902080_planningw_session_voter_groups'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '145e1c43cab940159d3a2f7624826194'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'stories_voted'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '152da0a81039418b852652e0378c596f'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                            element: 'display_value'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '15b43f8241774fee84d2f8d35920d4de'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'story'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '16ab7456960c48cdb1ef05a3544f3d04'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'status'
                            value: 'left'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '16ede524b57945ba9524971bd2c9b062'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'acceptance_criteria'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '17ca304b3ec048bca372f4296d17c93f'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'role'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1d1d386df9dc494083179825f5b97c69'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'vote_time'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1e6a7546813f4ab9bd017b4f652733b7'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'story_number'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '1e91a70c7be64df0bdcea76c6a8884b2'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1ec70e1c372d4e7dbcb73cf180ff1c33'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'voting_started'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '200b526525394f67b8e60fc318538dbd'
                        key: {
                            name: 'x_902080_planningw.facilitator'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2058e13a57434aa8ad573b690c8b07ee'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'easy_mode'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '20d694f2176f437581962319abfefd50'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'allow_spectators'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '233751225da946fa91c9fe001f83a6b1'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'total_stories'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '240a76770640469ab8c2871c7ec98b33'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'role'
                            value: 'spectator'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2719e0265bcb408981823615bfc7e7ff'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'stories_skipped'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '28d71f77b5ad4f71930cf836ac955bae'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'order'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2a48c2349bf8445ea60cb1664c86c756'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2c6f2d9515ca4e79816618723b765249'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '31b8798c10f24137af2edc12323e890d'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                            element: 'values'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '35609dd451c04e24ad0a6c85326d8225'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'vote_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '35ed907efecb4e64b54eb36926853fc6'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'voting_completed'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '370e7323ca594dfa8ee300f974d889b6'
                        key: {
                            name: 'x_902080_planningw.dealer'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3e1d2f4485644e6eb1e5ab57c678b1f5'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'story_description'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '3ea63a1c88e641d7ab2c870c3387b225'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'status'
                            value: 'skipped'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '3f87b565a3ae4f84a562119b4e2574dd'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'session'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '401761c919e64e838e067fa878b39aab'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'dealer'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '41a55ecce2684587bebea1ff3f59aee0'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'facilitator'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '4449297afd66441399ac20e323a91277'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'role'
                            value: 'dealer'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '467f2af35c66488b9da4c4fb57032478'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '46c4ff7668fd4e6c9879447283744678'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'story'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '475f1885b25e450db50b9ee4464f97c0'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4829602b4a114b51aaa2947f1f595185'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'total_stories'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '49b18d97a93c42c99a4274601c71320e'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'last_seen'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '49fcccc1e9934f53b0afa10d9c57dfc8'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4a22b66b3c0442aea4718598d9018159'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'session'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4f1f339be7904f40b723d4359d09f7e4'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '500f50a63d054d32954e6b6a1c1c73e4'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5324bbc833e2470ab0db79a46432af07'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'status'
                            value: 'voting'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '540f783494464751815e7a3c9990da19'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'story_title'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '54c6240616194e91939f31aaa0055455'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'user'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '580ed29163b245cc858756871c72778e'
                        key: {
                            name: 'x_902080_planningw_session_voter_groups'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '58a01c9266954b5ca135198cc75b0355'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'last_seen'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5a46e8fb9d2c4618886cd0f09472ab51'
                        key: {
                            name: 'x_902080_planningw_session_voter_groups'
                            element: 'voter_group'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5b3e01fbbfc240e18939cb335154674d'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'role'
                            value: 'voter'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5b70b8a558fe48669c08d300f04b1ae8'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'status'
                            value: 'completed'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '5b782729ee75476db782ab410810551c'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5c90855581dd45a0869b86414279d03f'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'story_points'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5df8ee5c12714a228ef5c06da81bc313'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'status'
                            value: 'cancelled'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5e4980c67c294e15a72dda714129949e'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5edaf7ceb0614058b90dab3f2acc7521'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                            element: 'numeric_value'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '601513b2b8a244c4aace11ff1a4a0100'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'total_votes'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '60477e82164b44909f430d0f0ad6ecf4'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '61b55fefac914b078901048e4bf36eaf'
                        key: {
                            name: 'x_902080_planningw_session_voter_groups'
                            element: 'voter_group'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '6250c2ae6f244fd4870def0620252da1'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6298c92c177e482c8b9db365ab7e65ce'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'acceptance_criteria'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '631bdc465b3b4bcfb66b0ab9403ccbcb'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'story_points'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '66012f960ebb45159f425019fed5a09e'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'joined_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6623a03c528a4c1d8d2bf84b10df8e17'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                            element: 'order'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '68d07ad8bda94d149a051da35c01014c'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'session_code'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6b076987044443778729980c615c96fd'
                        key: {
                            name: 'x_902080_planningw_session_voter_groups'
                            element: 'session'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6dc48db2f0f8441fa75c212e145b4447'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'dealer_comments'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '70fd80ec94ce4b238cca4e0347ef6f1c'
                        key: {
                            name: 'x_902080_planningw_session_voter_groups'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '716579e47754407ca3c1e02be41929c4'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'vote_numeric_value'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '71ea311cbc004cacb3ebf43a8d40e7ad'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7254819f367d4b7ab13aec5b582fa6c1'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'status'
                            value: 'pending'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '725914402d83450b85cef17f8a8a3518'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'dealer_group'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '72b2a216756c487882f3964833924419'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'scoring_method'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '732eaae9f2eb4502a5fb8ccc724dc987'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'status'
                            value: 'active'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '74b54057a21c4d169910ce465ad04c3c'
                        key: {
                            name: 'x_902080_planningw.spectator'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7571fd9c72fe42b09b48b36797426cb8'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                            element: 'display_value'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '78698db6547b49978923a9a3f70c230e'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '786f5229af9f43ce86589b22b93240ee'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'story_number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '78847099f0524ca49fe6982744f93359'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'session_code'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7f38c907912f4971bde3d2d0ce1a5843'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'allow_spectators'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '827d86cdfb9846b59c5ab81cc008a720'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '844aac6e047f445094b3442da609d537'
                        key: {
                            name: 'x_902080_planningw.admin'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '845663ee2ab74e81a852c789b8183edb'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'session_count'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '86a34d98a0cd42c4b4c7f48c0a0546f7'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'is_final_vote'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8813050f308c42f2a583c42fc32541ac'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                            element: 'scoring_method'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '89187d38a20c4e26b47767c8aa76c54a'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                            element: 'is_special'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8bd154729b4d4aca965a52faf9d1ee4e'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'description'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8c4b244f5d844922871f2f7605308f83'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'is_presenter'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '90c71234d7e3426abdee6503eefae6bd'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'session'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '90d36a29a2934d3bad4460dba79dc0eb'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'is_current_story'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '93a5092d199844edacd3846282ec59d1'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '944217efa58f4dc2899e35aa3b4f118d'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '94543e3f8c2243de95e3404ded5944d7'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9566c2d48e0446b68404211336b536a5'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'vote_value'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '963707bb5b4b45c3965d2c0a357015c1'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'stories_completed'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '98c62ee362d145f3bd1c220400d4518d'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9b1b88f1fd034e32a747e5de25bfde48'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                            element: 'allow_custom_values'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9b38b606254a4b85b2b4333283e1b365'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'stories_skipped'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9c16b4311c8943c8a8fe2ab94895f746'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                            element: 'is_default'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9c91957c798746b1ba732710720fc49d'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'is_online'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9d05992d2e1e446aa119d001ba759308'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'dealer'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9e3176512834434c9616d9a613c1adfa'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'stories_voted'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9f091076810f4fb88fc691ac74b5707b'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'facilitator'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'a054c7b15fb5414191381eb2d7cbd3aa'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a08601159d254acc9b2eecf358b08f52'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'description'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a0fcc621cafb437db51580b2d46e98dc'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'is_final_vote'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a15b52424aad4c00839bf0ab1299adf6'
                        key: {
                            name: 'x_902080_planningw_session_voter_groups'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a1814741b18d4f80b7d489264c63ba19'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'story'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a64f22db7afb4956b9d71f890e550735'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                            element: 'scoring_method'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a8cafa3882764fed9ccd09a0df16ab58'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'times_revoted'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'a8d4d3577d0a42daaf865de89963929a'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a97f87ee2b904035abc32c2e013f52b8'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'aa9e168e84074db5b2553774568d9c8f'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                            element: 'is_default'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ab10748e712d4dc29b3ac66155a09acc'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ac4cd1ba9ca945afb8f1871e386ca82f'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'voting_completed'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ad3b443c3b394a9980ee75a7167990ff'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'affe7e7dc1ee4d0db0735e69cd792f5f'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                            element: 'values'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b062db0d546243b0bb051dedba55270d'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'is_current_story'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'b0779f168a6a44be8d856c4be79b17b3'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b2c2605985814fb38fe43b57147af00e'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b4a1028b83574f6d9599be464074e886'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'stories_completed'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b56dbfb78fbb4671bfce068ca3e11ceb'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b73a50317928421093c140d7ddfdfd82'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                            element: 'order'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b810730d53a244299aa290c419bef922'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bc21763fca2847e7b9cc3cdd2b342b2c'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'story_title'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bde51054b8494811867937cf7924de63'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'be7767d1d17b4229b83370aa297a938d'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'total_votes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c1ccbd00475246c7bc94a7b74ef13c46'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'easy_mode'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c40582f87c6144af94df88e3635e5bd8'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'is_presenter'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c426b81eea9b48d19cf60f3e6c81b118'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'session'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c68fa0574ddd46339b3d1127f28efb6c'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'role'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c82916b66939484b89ddb4a04502c23d'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'current_story'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c90f88887cf14e80bc7fe3c733e366f1'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'session_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c9d8235924d443168cbdc23973c24566'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'role'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ca717b217050480f9d27d4ac4ac462a8'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'session'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cadb9ba2bd8f4f738858980ef2010c55'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'voter'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cafdf459b3714e539b91fb8811ec4b8c'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'dealer_comments'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cc1c2ea76bb34f599e2710ffd270b081'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ce73193cbbd14c7facb9ac65c3e4020c'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'current_story'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd104406b22364b05999550b70cd297f5'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'is_observer'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd11f5173948f44ffaacfee1565318d5c'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'vote_count'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd4eead61f89e4e08ab44a153dc0a1dd1'
                        key: {
                            name: 'x_902080_planningw_session_voter_groups'
                            element: 'session'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd4f0696790ab43cba96448ee7031c016'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_user_role_contains'
                        id: 'd56bd81cf7c5490688527b1eaa65d61c'
                        key: {
                            role: {
                                id: '200b526525394f67b8e60fc318538dbd'
                                key: {
                                    name: 'x_902080_planningw.facilitator'
                                }
                            }
                            contains: {
                                id: '370e7323ca594dfa8ee300f974d889b6'
                                key: {
                                    name: 'x_902080_planningw.dealer'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd5e7bd80ee4444c5929a1a04683a9b75'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'is_observer'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd6826250d9ce41e886730079198f8873'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'demo_mode'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd756a23cec1445c5adacf0941fc1593d'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'story'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd96bab5777594d09a0a526caa4cafc9b'
                        key: {
                            name: 'x_902080_planningw_scoring_method'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd9daacc53d3d46fd982793f924e1ccec'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'active_presenter'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'dd0e8a32efb54d29bb316e806dfcc307'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'dealer_group'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'de1a9e69d36c47b2bc1f6d3e9c0150c1'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'order'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e004b36816624242ae44eeebdb662291'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e02f988b60ef4927814ccaa1eaf846e8'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'vote_value'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e05f4c932f78450eae64e8b8e92c771d'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'session'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e201395ca72a4c0aaf21f88666e1532a'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'times_revoted'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e3503e38286640b79d6646fa9943183a'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'user'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: 'e4a7f5d421ef48d683309961267246e9'
                        key: {
                            name: 'x_902080_planningw.voter'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e910cb80eb9243c9b734f1234e2870dc'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'active_presenter'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e9607b8809644282a77f9f48504f8fd0'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'demo_mode'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ea20c93521e54d46a1a861dda9205473'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ead23f46904646dcb967fce1ad9c0ebe'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'is_online'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ec9288af3c3541c4863b272df460936a'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                            element: 'numeric_value'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ed897899640344cdbd94c33e9e23a8ee'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'voter'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'eebdccfa921b4a65b0923980f2a6677c'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'status'
                            value: 'idle'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f0899570835a49ee85ee01968bf78273'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'joined_at'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f08edf8210674133a340df99dbe85f34'
                        key: {
                            name: 'x_902080_planningw_planning_vote'
                            element: 'vote_numeric_value'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f19ec677eee94d40b1d7ba2f2c19f93e'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f32029f369824bbeaafb3964da30b4dc'
                        key: {
                            name: 'x_902080_planningw_scoring_value'
                            element: 'is_special'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'f3e2abe714284169aa9670724dd35021'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'f4701b0847b14dceb83900f0ab602894'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f4a83468edd14054b19d45f8b91ea70c'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'status'
                            value: 'revealed'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'f558d81649384a90b74a4f6b973b9f3c'
                        key: {
                            name: 'x_902080_planningw_session_participant'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f747458e32984c548b4412b62e72d8ed'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f8434ed926594fc6a605f2f3d7f33b65'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'voting_started'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f95b394e9ed243969bc233b69d02c9f3'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'fef45a5f2d8d4c7090689697c938d3c7'
                        key: {
                            name: 'x_902080_planningw_planning_session'
                            element: 'status'
                            value: 'ready'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ff8dd957daf44d448d5e89f9f5b3aebf'
                        key: {
                            name: 'x_902080_planningw_session_stories'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                ]
            }
        }
    }
}
