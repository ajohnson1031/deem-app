export enum MenuIconType {
  FEATHER = 'feather',
  FONT_AWESOME = 'fontawesome',
  FONT_AWESOME6 = 'fontawesome6',
  MATERIAL_COMM = 'material_community',
}

export interface MenuListItemProps {
  iconType: MenuIconType;
  iconName: any;
  iconSize?: number;
  labelText: string;
  helperText: string;
  hasBackground?: boolean;
  onPress: () => void;
}
