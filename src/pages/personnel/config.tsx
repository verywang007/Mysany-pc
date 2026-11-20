import { useState } from 'react';
import { App, Button, DatePicker, Empty, Space, Tabs, Tag } from 'antd';
import dayjs from 'dayjs';
import {
  listHolidays,
  listRules,
  saveHolidays,
  saveRules,
  type AttendanceHoliday,
  type AttendanceRule,
} from '@/services/personnel/attendance';
import RuleForm from './components/RuleForm';
import HolidayForm from './components/HolidayForm';
import styles from './index.module.css';
const methodNames = { phone: '手机打卡', project: '项目区域', device: '手机+设备打卡' };
export default function AttendanceConfig() {
  const { message, modal } = App.useApp();
  const [rules, setRules] = useState(listRules);
  const [holidays, setHolidays] = useState(listHolidays);
  const [year, setYear] = useState<dayjs.Dayjs | null>(dayjs());
  const [ruleOpen, setRuleOpen] = useState(false);
  const [holidayOpen, setHolidayOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AttendanceRule>();
  const [editingHoliday, setEditingHoliday] = useState<AttendanceHoliday>();
  const commitRules = (next: AttendanceRule[]) => {
    saveRules(next);
    setRules(next);
  };
  const commitHolidays = (next: AttendanceHoliday[]) => {
    saveHolidays(next);
    setHolidays(next);
  };
  const filteredHolidays = holidays.filter(
    (h) =>
      !year ||
      (h.start.slice(0, 4) <= year.format('YYYY') && h.end.slice(0, 4) >= year.format('YYYY')),
  );
  return (
    <div className={styles.page}>
      <Tabs
        items={[
          {
            key: 'rules',
            label: '考勤规则',
            children: (
              <>
                <div className={styles.toolbar}>
                  <h3>规则列表</h3>
                  <Button
                    type="primary"
                    className={styles.pushRight}
                    onClick={() => {
                      setEditingRule(undefined);
                      setRuleOpen(true);
                    }}
                  >
                    新建规则
                  </Button>
                </div>
                {rules.length ? (
                  <div className={styles.ruleCards}>
                    {rules.map((rule) => (
                      <section className={styles.savedCard} key={rule.id}>
                        <div className={styles.toolbar}>
                          <h3>{rule.name}</h3>
                          <Tag>{rule.type === 'fixed' ? '固定工时' : '弹性工时'}</Tag>
                          <Space className={styles.pushRight}>
                            <Button
                              type="link"
                              onClick={() => {
                                setEditingRule(rule);
                                setRuleOpen(true);
                              }}
                            >
                              编辑
                            </Button>
                            <Button
                              type="link"
                              danger
                              onClick={() =>
                                modal.confirm({
                                  title: '删除规则',
                                  content: `确定删除「${rule.name}」？`,
                                  onOk: () => {
                                    commitRules(rules.filter((r) => r.id !== rule.id));
                                    message.success('规则已删除');
                                  },
                                })
                              }
                            >
                              删除
                            </Button>
                          </Space>
                        </div>
                        <p>适用对象：{rule.organizations.join('、')}</p>
                        <p>
                          {rule.type === 'fixed'
                            ? `上班 ${rule.onWindow.join(' ~ ')} 下班 ${rule.offWindow.join(' ~ ')}`
                            : `每日工时 ${rule.dailyHours} 小时`}
                        </p>
                        <p>
                          工作日：
                          {rule.weekdays.map((d) => '周' + '一二三四五六日'[d - 1]).join('、')}
                        </p>
                        <p>打卡方式：{rule.methods.map((m) => methodNames[m]).join('、')}</p>
                        <p>安全验证：拍照水印</p>
                      </section>
                    ))}
                  </div>
                ) : (
                  <Empty
                    className={styles.configEmpty}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无数据"
                  />
                )}
              </>
            ),
          },
          {
            key: 'holidays',
            label: '节假日配置',
            children: (
              <>
                <div className={styles.toolbar}>
                  <DatePicker
                    value={year}
                    picker="year"
                    placeholder="请选择年份"
                    onChange={setYear}
                  />
                  <Button
                    type="primary"
                    className={styles.pushRight}
                    onClick={() => {
                      setEditingHoliday(undefined);
                      setHolidayOpen(true);
                    }}
                  >
                    添加节假日
                  </Button>
                </div>
                {filteredHolidays.length ? (
                  <div className={styles.ruleCards}>
                    {filteredHolidays.map((holiday) => (
                      <section className={styles.savedCard} key={holiday.id}>
                        <div className={styles.toolbar}>
                          <h3>{holiday.name}</h3>
                          <Tag>{holiday.type}</Tag>
                          <Space className={styles.pushRight}>
                            <Button
                              type="link"
                              onClick={() => {
                                setEditingHoliday(holiday);
                                setHolidayOpen(true);
                              }}
                            >
                              编辑
                            </Button>
                            <Button
                              type="link"
                              danger
                              onClick={() =>
                                modal.confirm({
                                  title: '删除节假日',
                                  content: `确定删除「${holiday.name}」？`,
                                  onOk: () => {
                                    commitHolidays(holidays.filter((h) => h.id !== holiday.id));
                                    message.success('节假日已删除');
                                  },
                                })
                              }
                            >
                              删除
                            </Button>
                          </Space>
                        </div>
                        <p>
                          {holiday.start} ~ {holiday.end}
                        </p>
                        {holiday.remark && <p>{holiday.remark}</p>}
                      </section>
                    ))}
                  </div>
                ) : (
                  <Empty
                    className={styles.configEmpty}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无数据"
                  />
                )}
              </>
            ),
          },
        ]}
      />
      <RuleForm
        open={ruleOpen}
        rule={editingRule}
        onCancel={() => setRuleOpen(false)}
        onSave={(rule) => {
          commitRules(
            editingRule ? rules.map((r) => (r.id === rule.id ? rule : r)) : [...rules, rule],
          );
          setRuleOpen(false);
          message.success('规则已保存');
        }}
      />
      <HolidayForm
        open={holidayOpen}
        holiday={editingHoliday}
        onCancel={() => setHolidayOpen(false)}
        onSave={(holiday) => {
          commitHolidays(
            editingHoliday
              ? holidays.map((h) => (h.id === holiday.id ? holiday : h))
              : [...holidays, holiday],
          );
          setHolidayOpen(false);
          message.success('节假日已保存');
        }}
      />
    </div>
  );
}
